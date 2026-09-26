import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ReceiptDomain } from '../../../models/receipts-domain.model';

@Component({
  selector: 'p-receipts-list',
  imports: [CommonModule],
  template: `<div class="receipts-container">
    <!-- Desktop View - Modern Card Design -->
    <div class="desktop-view m-2">
      <div class="receipts-grid">
        @for (receipt of receipts; track receipt.id) {
          <div
            class="receipt-card"
            [class.expanded]="expandedId === receipt.id"
          >
            <!-- Card Header -->
            <div class="card-header" (click)="toggle(receipt.id)">
              <div class="header-left">
                <div
                  class="provider-icon"
                  [ngClass]="getProviderIconClass(receipt.provider)"
                >
                  <span class="provider-initial">{{
                    receipt.provider.charAt(0)
                  }}</span>
                </div>
                <div class="provider-details">
                  {{ receipt.date | date: 'dd MMM yyyy' }}
                </div>
                <span class="products-count">{{
                  receipt.products.length
                }}</span>
              </div>
              <div class="header-right">
                <div class="price-summary">
                  <div class="total-price">
                    <span class="price-value">{{
                      receipt.totalPrice | currency: 'RON'
                    }}</span>
                  </div>
                  @if (receipt.totalDiscount) {
                    <div class="discount-badge">
                      <span
                        >-{{ receipt.totalDiscount | currency: 'RON' }}</span
                      >
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Expanded Content -->
            @if (expandedId === receipt.id) {
              <div class="card-expanded">
                <div class="products-section">
                  <div class="products-table-wrapper">
                    <table class="products-table">
                      <tbody>
                        @for (product of receipt.products; track product.id) {
                          <tr class="product-row">
                            <td class="product-name-cell">
                              <div class="product-name">{{ product.name }}</div>
                            </td>
                            <td class="product-price">
                              {{ product.price | currency: 'RON' }}
                            </td>
                            <td class="product-type">
                              <span class="type-badge"
                                >{{ product.quantity }}x
                                {{ product.quantityType }}</span
                              >
                            </td>
                            <td class="product-total">
                              <strong>{{
                                product.price * product.quantity
                                  | currency: 'RON'
                              }}</strong>
                            </td>
                            <td class="product-vat">
                              <span class="vat-badge">{{ product.vat }}%</span>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Mobile View -->
    <div class="mobile-view">
      @for (receipt of receipts; track receipt.id) {
        <div class="mobile-card">
          <div class="mobile-card-header" (click)="toggle(receipt.id)">
            <div class="mobile-header-left">
              <div
                class="provider-initial"
                [ngClass]="getProviderIconClass(receipt.provider)"
              >
                {{ receipt.provider.charAt(0) }}
              </div>
              <div class="mobile-provider-info">
                <div class="mobile-date">
                  {{ receipt.date | date: 'dd MMM yyyy' }}
                </div>
              </div>
              <span class="products-count">{{ receipt.products.length }}</span>
            </div>
            <div class="mobile-header-right">
              <div class="mobile-total">
                <span class="total-value">{{
                  receipt.totalPrice | currency: 'RON'
                }}</span>
              </div>
              @if (receipt.totalDiscount) {
                <div class="mobile-discount">
                  -{{ receipt.totalDiscount | currency: 'RON' }}
                </div>
              }
            </div>
          </div>

          @if (expandedId === receipt.id) {
            <div class="mobile-card-body">
              <div class="mobile-products-list">
                @for (product of receipt.products; track product.id) {
                  <div class="mobile-product-item">
                    <div class="mobile-product-header">
                      <span class="product-name">{{ product.name }}</span>
                      <span class="product-quantity-badge"
                        >x{{ product.quantity }}
                        {{ product.quantityType }}</span
                      >
                    </div>
                    <div class="mobile-product-details">
                      <div class="detail-item">
                        <span class="detail-label">Price</span>
                        <span class="detail-value">{{ product.price }}</span>
                      </div>

                      <div class="detail-item">
                        <span class="detail-label">VAT</span>
                        <span class="detail-value vat">{{ product.vat }}%</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Total</span>
                        <span class="detail-value total">{{
                          product.price * product.quantity
                        }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  </div> `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    /* Container */
    .receipts-container {
      overflow-y: auto;
    }

    .desktop-view {
      display: block;
    }
    .receipts-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Receipt Card */
    .receipt-card {
      background: var(--theme-surface);
      border-radius: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--theme-shadow-raised);
      overflow: hidden;
    }

    .receipt-card.expanded {
      box-shadow: var(--theme-shadow-raised);
    }

    /* Card Header */
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--theme-surface);
    }
    .receipt-card.expanded .card-header {
      background: linear-gradient(135deg, var(--theme-surface) 0%, #f0f9ff 100%);
      border-bottom: 2px solid var(--theme-border);
    }

    /* Header Sections */
    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
      flex: 1;
    }

    /* Provider Icon Base Styles */
    .provider-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .provider-initial {
      font-size: 20px;
      font-weight: 700;
      text-transform: uppercase;
      position: relative;
      z-index: 1;
    }

    /* CARREFOUR: Smooth Blue to Red gradient */
    .provider-icon-carrefour {
      background: linear-gradient(
        135deg,
        #1e3a8a 0%,
        var(--theme-accent) 50%,
        var(--theme-danger) 100%
      );
      box-shadow: var(--theme-shadow-raised);
    }

    .provider-icon-carrefour .provider-initial {
      color: var(--theme-surface);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .provider-icon-lidl {
      background: linear-gradient(
        135deg,
        #0050AA 0%,
        #0050AA 50%,
        #ffc107 100%
      );
      color: var(--theme-surface);
      position: relative;
      box-shadow: var(--theme-shadow-raised);
    }

    .provider-icon-lidl .provider-initial {
      color: var(--theme-surface);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .provider-icon-kaufland {
      background: linear-gradient(
        135deg,
        #991b1b 0%,
        var(--theme-danger) 50%,
        var(--theme-danger) 100%
      );
      box-shadow: var(--theme-shadow-raised);
    }

    .provider-icon-kaufland .provider-initial {
      color: var(--theme-surface);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .provider-icon-default {
      background: linear-gradient(135deg, var(--theme-accent) 0%, #6366f1 100%);
      box-shadow: var(--theme-shadow-raised);
    }

    .provider-icon-default .provider-initial {
      color: var(--theme-surface);
    }

    .provider-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .provider-name {
      font-size: 18px;
      font-weight: 700;
      color: var(--theme-text-primary);
      margin: 0;
      letter-spacing: -0.3px;
    }
    .receipt-date {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--theme-text-secondary);
      font-size: 12px;
      font-weight: 500;
    }
    .receipt-date svg {
      color: var(--theme-text-muted);
    }

    /* Header Right */
    .header-right {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .price-summary {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .total-price {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }
    .price-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--theme-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .price-value {
      font-size: 20px;
      font-weight: 800;
      color: var(--theme-success);
      letter-spacing: -0.5px;
    }
    .discount-badge {
      background: linear-gradient(135deg, var(--theme-danger-subtle) 0%, var(--theme-danger-subtle) 100%);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      color: var(--theme-danger);
    }

    /* Expand Button */
    .expand-btn {
      background: var(--theme-hover);
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      color: var(--theme-text-secondary);
    }

    .expand-btn.rotated svg {
      transform: rotate(180deg);
    }
    .expand-btn svg {
      transition: transform 0.3s;
    }

    /* Expanded Content */
    .card-expanded {
      animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(180deg, var(--theme-surface-muted) 0%, var(--theme-surface) 100%);
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Products Section */
    .products-section {
      padding: 10px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .title-icon {
      font-size: 24px;
    }
    .section-title h4 {
      font-size: 18px;
      font-weight: 700;
      color: var(--theme-text-primary);
      margin: 0;
    }
    .products-count {
      background: var(--theme-accent);
      color: var(--theme-surface);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .section-summary {
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
    }
    .summary-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--theme-text-secondary);
      padding: 6px 12px;
      background: var(--theme-surface);
      border-radius: 8px;
      box-shadow: var(--theme-shadow-raised);
    }
    .summary-item strong {
      color: var(--theme-text-primary);
      font-weight: 700;
    }
    .summary-item.discount strong {
      color: var(--theme-danger);
    }
    .summary-item.total {
      background: linear-gradient(135deg, var(--theme-success-subtle) 0%, var(--theme-success-subtle) 100%);
    }
    .summary-item.total strong {
      color: var(--theme-success);
      font-size: 14px;
    }

    /* Products Table */
    .products-table-wrapper {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid var(--theme-border);
      background: var(--theme-surface);
    }
    .products-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 800px;
    }
    .products-table th {
      padding: 14px 16px;
      background: linear-gradient(135deg, var(--theme-surface-muted) 0%, var(--theme-hover) 100%);
      color: var(--theme-text-secondary);
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      border-bottom: 2px solid var(--theme-border);
    }
    .products-table td {
      padding: 14px 16px;
      color: var(--theme-text-primary);
      font-size: 13px;
      border-bottom: 1px solid var(--theme-hover);
    }
    .product-row {
      transition: all 0.2s;
    }

    .product-row:last-child td {
      border-bottom: none;
    }
    .product-name-cell {
      font-weight: 600;
      color: var(--theme-text-primary);
    }
    .product-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .product-price {
      color: var(--theme-success);
      font-weight: 600;
    }

    .quantity-badge {
      display: inline-block;
      background: var(--theme-border);
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
      color: var(--theme-text-secondary);
    }
    .type-badge {
      display: inline-block;
      background: var(--theme-accent-subtle);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      color: var(--theme-accent);
    }
    .vat-badge {
      display: inline-block;
      background: var(--theme-danger-subtle);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      color: var(--theme-danger);
    }
    .product-total {
      font-weight: 700;
      color: var(--theme-accent);
    }

    /* Mobile View */
    .mobile-view {
      display: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .desktop-view {
        display: none;
      }
      .mobile-view {
        display: block;
        padding: 12px;
        overflow-y: auto;
        height: calc(100vh - 100px);
      }
      .mobile-card {
        background: var(--theme-surface);
        border: 1px solid #e2e6ee;
        border-radius: 12px;
        margin-bottom: 12px;
        overflow: hidden;
        box-shadow: var(--theme-shadow-raised);
      }
      .mobile-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: var(--theme-accent-subtle);
        cursor: pointer;
      }
      .mobile-card-header:active {
        background: var(--theme-accent-subtle);
      }
      .mobile-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }

      /* Mobile provider icon styles */
      .provider-initial {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        position: relative;
        overflow: hidden;
      }

      .provider-icon-carrefour {
        background: linear-gradient(
          135deg,
          #1e3a8a 0%,
          var(--theme-accent) 50%,
          var(--theme-danger) 100%
        );
        color: var(--theme-surface);
      }

      .provider-icon-lidl {
        background: linear-gradient(
          135deg,
          #0050AA 0%,
          #0050AA 50%,
          #ffc107 100%
        );
        color: var(--theme-surface);
        position: relative;
      }

      .provider-icon-kaufland {
        background: linear-gradient(
          135deg,
          #991b1b 0%,
          var(--theme-danger) 50%,
          var(--theme-danger) 100%
        );
        color: var(--theme-surface);
      }

      .provider-icon-default {
        background: linear-gradient(135deg, var(--theme-accent) 0%, #6366f1 100%);
        color: var(--theme-surface);
      }

      .mobile-provider-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .mobile-provider-name {
        font-weight: 600;
        font-size: 14px;
        color: var(--theme-text-primary);
      }
      .mobile-date {
        font-size: 11px;
        color: var(--theme-text-secondary);
      }
      .mobile-header-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .total-label {
        font-size: 9px;
        color: var(--theme-text-secondary);
        text-transform: uppercase;
        display: block;
      }
      .total-value {
        font-weight: 700;
        font-size: 14px;
        color: var(--theme-success);
      }
      .mobile-discount {
        background: var(--theme-danger-subtle);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        color: var(--theme-danger);
      }
      .mobile-expand-btn {
        background: var(--theme-surface);
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--theme-text-secondary);
      }
      .mobile-expand-btn.rotated svg {
        transform: rotate(180deg);
      }
      .mobile-expand-btn svg {
        transition: transform 0.3s;
      }
      .mobile-card-body {
        border-top: 1px solid #e2e6ee;
        animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .mobile-products-list {
        padding: 12px;
      }
      .mobile-product-item {
        background: var(--theme-surface-muted);
        border-radius: 10px;
        margin-bottom: 10px;
        padding: 12px;
        border-left: 3px solid var(--theme-accent);
      }
      .mobile-product-item:last-child {
        margin-bottom: 0;
      }
      .mobile-product-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--theme-border);
      }
      .mobile-product-header .product-name {
        font-weight: 600;
        font-size: 13px;
        color: var(--theme-text-primary);
      }
      .product-quantity-badge {
        background: var(--theme-border);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        color: var(--theme-text-secondary);
      }
      .mobile-product-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 5px;
      }
      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .detail-label {
        font-size: 9px;
        color: var(--theme-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .detail-value {
        font-weight: 600;
        font-size: 12px;
        color: var(--theme-text-primary);
      }
      .detail-value.vat {
        color: var(--theme-danger);
      }
      .detail-value.total {
        color: var(--theme-accent);
      }
      .mobile-summary {
        padding: 12px;
        background: var(--theme-hover);
        border-top: 1px solid var(--theme-border);
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: var(--theme-text-secondary);
        margin-bottom: 6px;
      }
      .summary-row:last-child {
        margin-bottom: 0;
      }
      .summary-row strong {
        color: var(--theme-text-primary);
      }
      .summary-row.discount strong {
        color: var(--theme-danger);
      }
      .summary-row.total {
        font-size: 14px;
        font-weight: 700;
        padding-top: 6px;
        border-top: 1px solid #cbd5e1;
        margin-top: 6px;
      }
      .summary-row.total strong {
        color: var(--theme-success);
        font-size: 16px;
      }
    }

    @media (max-width: 480px) {
      .mobile-view {
        padding: 8px;
      }
      .mobile-card-header {
        padding: 10px;
      }
      .provider-initial {
        width: 36px;
        height: 36px;
        font-size: 14px;
      }
      .mobile-provider-name {
        font-size: 13px;
      }
      .total-value {
        font-size: 13px;
      }
      .mobile-discount {
        font-size: 10px;
        padding: 3px 6px;
      }
      .mobile-product-item {
        padding: 10px;
      }
      .mobile-product-header .product-name {
        font-size: 12px;
      }
      .detail-value {
        font-size: 11px;
      }
      .summary-row.total strong {
        font-size: 14px;
      }
    }
  `,
})
export class ReceiptListComponent {
  @Input() receipts: ReceiptDomain[] = [];

  expandedId: number | null = null;

  toggle(id: number) {
    if (this.expandedId === id) {
      this.expandedId = null;
    } else {
      this.expandedId = id;
    }
  }

  getProviderIconClass(provider: string): string {
    const normalizedProvider = provider?.toUpperCase() || '';

    if (normalizedProvider.includes('CARREFOUR')) {
      return 'provider-icon-carrefour';
    } else if (normalizedProvider.includes('LIDL')) {
      return 'provider-icon-lidl';
    } else if (normalizedProvider.includes('KAUFLAND')) {
      return 'provider-icon-kaufland';
    } else {
      return 'provider-icon-default';
    }
  }
}
