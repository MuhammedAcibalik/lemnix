/**
 * Production Plan Item Domain Entity
 *
 * Represents a single item in a production plan
 *
 * @module domain/entities/ProductionPlanItem
 * @version 1.0.0
 */

export interface ProductionPlanItemProps {
  readonly id: string;
  readonly planId: string;
  readonly ad: string;
  readonly siparisVeren: string;
  readonly musteriNo: string;
  readonly musteriKalemi: string;
  readonly siparis: string;
  readonly malzemeNo: string;
  readonly malzemeKisaMetni: string;
  readonly miktar: number;
  readonly planlananBitisTarihi: Date;
  readonly bolum: string;
  readonly oncelik: string;
  readonly linkedCuttingListId?: string | null;
  readonly encryptedAd?: string | null;
  readonly encryptedMalzemeKisaMetni?: string | null;
  readonly encryptedMalzemeNo?: string | null;
  readonly encryptedMusteriKalemi?: string | null;
  readonly encryptedMusteriNo?: string | null;
  readonly encryptedSiparis?: string | null;
  readonly encryptedSiparisVeren?: string | null;
}

/**
 * Production Plan Item Domain Entity
 */
export class ProductionPlanItem {
  private constructor(private readonly props: ProductionPlanItemProps) {
    this.validate();
  }

  /**
   * Create a new ProductionPlanItem
   */
  public static create(props: ProductionPlanItemProps): ProductionPlanItem {
    return new ProductionPlanItem(props);
  }

  /**
   * Reconstruct from persistence
   */
  public static fromPersistence(
    props: ProductionPlanItemProps,
  ): ProductionPlanItem {
    return new ProductionPlanItem(props);
  }

  /**
   * Validate entity invariants
   */
  private validate(): void {
    if (!this.props.id || this.props.id.trim().length === 0) {
      throw new Error("ProductionPlanItem id is required");
    }
    if (!this.props.planId || this.props.planId.trim().length === 0) {
      throw new Error("ProductionPlanItem planId is required");
    }
    if (this.props.miktar <= 0) {
      throw new Error("ProductionPlanItem miktar must be greater than 0");
    }
    if (this.props.ad.length > 200) {
      throw new Error("ProductionPlanItem ad must be 200 characters or less");
    }
    if (this.props.malzemeKisaMetni.length > 500) {
      throw new Error(
        "ProductionPlanItem malzemeKisaMetni must be 500 characters or less",
      );
    }
  }

  // Getters
  public get id(): string {
    return this.props.id;
  }

  public get planId(): string {
    return this.props.planId;
  }

  public get ad(): string {
    return this.props.ad;
  }

  public get siparisVeren(): string {
    return this.props.siparisVeren;
  }

  public get musteriNo(): string {
    return this.props.musteriNo;
  }

  public get musteriKalemi(): string {
    return this.props.musteriKalemi;
  }

  public get siparis(): string {
    return this.props.siparis;
  }

  public get malzemeNo(): string {
    return this.props.malzemeNo;
  }

  public get malzemeKisaMetni(): string {
    return this.props.malzemeKisaMetni;
  }

  public get miktar(): number {
    return this.props.miktar;
  }

  public get planlananBitisTarihi(): Date {
    return this.props.planlananBitisTarihi;
  }

  public get bolum(): string {
    return this.props.bolum;
  }

  public get oncelik(): string {
    return this.props.oncelik;
  }

  public get linkedCuttingListId(): string | null | undefined {
    return this.props.linkedCuttingListId;
  }

  public get encryptedAd(): string | null | undefined {
    return this.props.encryptedAd;
  }

  public get encryptedMalzemeKisaMetni(): string | null | undefined {
    return this.props.encryptedMalzemeKisaMetni;
  }

  public get encryptedMalzemeNo(): string | null | undefined {
    return this.props.encryptedMalzemeNo;
  }

  public get encryptedMusteriKalemi(): string | null | undefined {
    return this.props.encryptedMusteriKalemi;
  }

  public get encryptedMusteriNo(): string | null | undefined {
    return this.props.encryptedMusteriNo;
  }

  public get encryptedSiparis(): string | null | undefined {
    return this.props.encryptedSiparis;
  }

  public get encryptedSiparisVeren(): string | null | undefined {
    return this.props.encryptedSiparisVeren;
  }

  /**
   * Link to cutting list
   */
  public linkToCuttingList(cuttingListId: string): ProductionPlanItem {
    return new ProductionPlanItem({
      ...this.props,
      linkedCuttingListId: cuttingListId,
    });
  }

  /**
   * Unlink from cutting list
   */
  public unlinkFromCuttingList(): ProductionPlanItem {
    return new ProductionPlanItem({
      ...this.props,
      linkedCuttingListId: null,
    });
  }

  /**
   * Check if linked to cutting list
   */
  public isLinkedToCuttingList(): boolean {
    return (
      this.props.linkedCuttingListId !== null &&
      this.props.linkedCuttingListId !== undefined
    );
  }

  /**
   * Update priority
   */
  public updatePriority(oncelik: string): ProductionPlanItem {
    if (oncelik.length > 50) {
      throw new Error(
        "ProductionPlanItem oncelik must be 50 characters or less",
      );
    }
    return new ProductionPlanItem({
      ...this.props,
      oncelik,
    });
  }
}
