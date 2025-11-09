import { Request } from "express";

export interface DataProtectionRule {
  matcher: RegExp;
  table: string;
  sensitiveFields?: string[];
  metadataFields?: string[];
  methods?: Array<"GET" | "POST" | "PUT" | "PATCH">;
}

const rules: DataProtectionRule[] = [
  {
    matcher: /^\/production-plan\/upload/,
    table: "production_plan_items",
    sensitiveFields: [
      "siparisVeren",
      "musteriNo",
      "musteriKalemi",
      "siparis",
      "malzemeNo",
      "malzemeKisaMetni",
    ],
    metadataFields: [],
    methods: ["POST"],
  },
  {
    matcher: /^\/production-plan\b/,
    table: "production_plans",
    metadataFields: ["metadata"],
    methods: ["GET", "POST"],
  },
  {
    matcher: /^\/cutting-list\b/,
    table: "cutting_lists",
    metadataFields: ["metadata"],
  },
  {
    matcher: /^\/optimization\b/,
    table: "optimizations",
    metadataFields: ["parameters", "result", "metadata"],
  },
  {
    matcher: /^\/user\b/,
    table: "users",
    sensitiveFields: ["email", "name"],
  },
  {
    matcher: /^\/material-profile-mapping\b/,
    table: "material_profile_mappings",
    sensitiveFields: ["malzemeNo", "malzemeKisaMetni"],
  },
];

export interface DataProtectionContext {
  table: string;
  sensitiveFields: string[];
  metadataFields: string[];
}

export function resolveDataProtection(
  req: Request,
): DataProtectionContext | null {
  const rule = rules.find((candidate) => {
    if (!candidate.matcher.test(req.path)) {
      return false;
    }

    if (!candidate.methods) {
      return true;
    }

    return candidate.methods.includes(
      req.method as (typeof candidate.methods)[number],
    );
  });

  if (!rule) {
    return null;
  }

  return {
    table: rule.table,
    sensitiveFields: rule.sensitiveFields ?? [],
    metadataFields: rule.metadataFields ?? [],
  };
}

export function registerDataProtectionRule(rule: DataProtectionRule): void {
  rules.push(rule);
}
