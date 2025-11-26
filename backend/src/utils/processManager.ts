/**
 * Process Management Utility
 * Platform-agnostic process and port management
 *
 * @module utils/processManager
 * @version 1.0.0
 */

import { exec } from "node:child_process";
import { promisify } from "node:util";
import { logger } from "../services/logger";

const execAsync = promisify(exec);

/**
 * Platform detection
 */
export const isWindows = process.platform === "win32";
export const isLinux = process.platform === "linux";
export const isMacOS = process.platform === "darwin";

/**
 * Find process ID using a specific port
 * @param port - Port number
 * @returns Process ID or null if not found
 */
export async function findProcessByPort(port: number): Promise<number | null> {
  try {
    if (isWindows) {
      // Windows: netstat -ano | findstr :PORT | findstr LISTENING
      const { stdout } = await execAsync(
        `netstat -ano | findstr :${port} | findstr LISTENING`,
      );
      const match = stdout.match(/\s+(\d+)\s*$/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    } else {
      // Linux/MacOS: lsof -i :PORT -t
      const { stdout } = await execAsync(`lsof -i :${port} -t`);
      const pid = stdout.trim();
      if (pid) {
        return parseInt(pid, 10);
      }
    }
    return null;
  } catch (error) {
    // Port not in use or command failed
    logger.debug("No process found on port", { port, error });
    return null;
  }
}

/**
 * Kill process by ID
 * @param pid - Process ID
 * @param force - Force kill (SIGKILL)
 * @returns True if successful
 */
export async function killProcess(
  pid: number,
  force: boolean = false,
): Promise<boolean> {
  try {
    if (isWindows) {
      // Windows: taskkill /F /PID PID
      const flag = force ? "/F" : "";
      await execAsync(`taskkill ${flag} /PID ${pid}`);
    } else {
      // Linux/MacOS: kill -9 PID (force) or kill PID (graceful)
      const signal = force ? "-9" : "";
      await execAsync(`kill ${signal} ${pid}`);
    }
    logger.info("Process killed successfully", { pid, force });
    return true;
  } catch (error) {
    logger.error("Failed to kill process", {
      pid,
      error: (error as Error).message,
    });
    return false;
  }
}

/**
 * Kill process using a specific port
 * @param port - Port number
 * @param force - Force kill
 * @returns True if successful
 */
export async function killProcessByPort(
  port: number,
  force: boolean = false,
): Promise<boolean> {
  const pid = await findProcessByPort(port);
  if (!pid) {
    logger.debug("No process found on port", { port });
    return false;
  }
  return killProcess(pid, force);
}

/**
 * Check if port is available
 * @param port - Port number
 * @returns True if port is available
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  const pid = await findProcessByPort(port);
  return pid === null;
}

/**
 * Wait for port to be released
 * @param port - Port number
 * @param timeout - Timeout in milliseconds (default 5000)
 * @param interval - Check interval in milliseconds (default 100)
 * @returns True if port was released within timeout
 */
export async function waitForPortRelease(
  port: number,
  timeout: number = 5000,
  interval: number = 100,
): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const pid = await findProcessByPort(port);
    if (pid === null) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return false;
}

