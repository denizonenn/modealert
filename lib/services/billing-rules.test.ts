import { describe, expect, it } from "vitest";

import {
  isAllowedWebhookIp,
  isLifetimePurchase,
  planForSubscriptionStatus,
  shouldRevokeLifetime,
} from "./billing-rules";

describe("planForSubscriptionStatus", () => {
  it("grants Premium for active and trialing", () => {
    expect(planForSubscriptionStatus("active")).toBe("PREMIUM");
    expect(planForSubscriptionStatus("trialing")).toBe("PREMIUM");
  });

  it("keeps Premium while past_due (Paddle is still retrying the card)", () => {
    expect(planForSubscriptionStatus("past_due")).toBe("PREMIUM");
  });

  it("revokes Premium only once actually canceled or paused", () => {
    expect(planForSubscriptionStatus("canceled")).toBe("FREE");
    expect(planForSubscriptionStatus("paused")).toBe("FREE");
  });

  it("treats an unknown status as no access", () => {
    expect(planForSubscriptionStatus("something_new")).toBe("FREE");
  });
});

const LIFETIME = "pri_lifetime";

describe("isLifetimePurchase", () => {
  it("is true for a one-time transaction containing the lifetime price", () => {
    expect(
      isLifetimePurchase(
        { subscriptionId: null, items: [{ price: { id: LIFETIME } }] },
        LIFETIME
      )
    ).toBe(true);
  });

  it("is false for a subscription payment, even with a matching price", () => {
    expect(
      isLifetimePurchase(
        { subscriptionId: "sub_1", items: [{ price: { id: LIFETIME } }] },
        LIFETIME
      )
    ).toBe(false);
  });

  it("is false for a different price", () => {
    expect(
      isLifetimePurchase(
        { subscriptionId: null, items: [{ price: { id: "pri_monthly" } }] },
        LIFETIME
      )
    ).toBe(false);
  });

  it("is false when no lifetime price is configured", () => {
    expect(
      isLifetimePurchase(
        { subscriptionId: null, items: [{ price: { id: "" } }] },
        ""
      )
    ).toBe(false);
  });
});

describe("shouldRevokeLifetime", () => {
  const fullRefund = {
    status: "approved",
    type: "full",
    action: "refund",
    subscriptionId: null,
  };

  it("revokes on an approved full refund", () => {
    expect(shouldRevokeLifetime(fullRefund)).toBe(true);
  });

  it("revokes on an approved full chargeback", () => {
    expect(shouldRevokeLifetime({ ...fullRefund, action: "chargeback" })).toBe(true);
  });

  it("does not revoke while the refund is still pending approval", () => {
    expect(
      shouldRevokeLifetime({ ...fullRefund, status: "pending_approval" })
    ).toBe(false);
  });

  it("does not revoke on a partial refund", () => {
    expect(shouldRevokeLifetime({ ...fullRefund, type: "partial" })).toBe(false);
  });

  it("does not revoke for a subscription's adjustment", () => {
    expect(
      shouldRevokeLifetime({ ...fullRefund, subscriptionId: "sub_1" })
    ).toBe(false);
  });
});

describe("isAllowedWebhookIp", () => {
  const cidrs = ["34.237.3.244/32", "52.11.166.252/32"];

  it("allows an address on Paddle's list", () => {
    expect(isAllowedWebhookIp("52.11.166.252", cidrs)).toBe(true);
  });

  it("rejects any other address", () => {
    expect(isAllowedWebhookIp("1.2.3.4", cidrs)).toBe(false);
  });

  it("rejects when the client address is unknown", () => {
    expect(isAllowedWebhookIp(null, cidrs)).toBe(false);
  });

  it("does not match on a prefix of an allowed address", () => {
    expect(isAllowedWebhookIp("34.237.3.24", cidrs)).toBe(false);
  });
});
