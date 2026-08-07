# Evaluation Report

**Total Tests**: 10
**Passed**: 8
**Failed**: 2
**Success Rate**: 80.0%
**Average Quality Score**: 0.850 / 1.0

## Test Details

### Task 1 (Triage)

| Test ID | Type | Description | Result | Score | Time (ms) | Details |
|---------|------|-------------|--------|-------|-----------|---------|
| TC-1-01 | Normal | P1 DataBridge timeout ticket → Urgency=P1, category=Bug | ❌ Fail | 0.5 | 166559.7 | Expected urgency_tier=P1, got P3 |
| TC-1-02 | Normal | Billing question → category=Billing, team=Billing | ✅ Pass | 1.0 | 134594.9 | All criteria met. |
| TC-1-03 | Normal | SSO error ticket → KB match=authentication-sso.md | ❌ Fail | 0.0 | 124515.4 | Expected kb_match.doc_id to contain authentication-sso |
| TC-1-04 | Normal | Feature request → category=Feature Request | ✅ Pass | 1.0 | 132469.5 | All criteria met. |
| TC-1-05 | Adversarial | Ambiguous ticket → confidence<0.7, no hallucination | ✅ Pass | 1.0 | 96194.7 | All criteria met. |

### Task 2 (Account Brief)

| Test ID | Type | Description | Result | Score | Time (ms) | Details |
|---------|------|-------------|--------|-------|-----------|---------|
| TC-2-01 | Normal | Healthy account → No churn flags | ✅ Pass | 1.0 | 81.4 | All criteria met. |
| TC-2-02 | Normal | At Risk account → Risk section non-empty | ✅ Pass | 1.0 | 55438.9 | All criteria met. |
| TC-2-03 | Normal | Account with P1 tickets → Escalation signal detected | ✅ Pass | 1.0 | 66567.3 | All criteria met. |
| TC-2-04 | Normal | Determinism test → 2 runs produce identical output | ✅ Pass | 1.0 | 25190.2 | Outputs are identical |
| TC-2-05 | Adversarial | account_id not in accounts.json → Graceful fallback | ✅ Pass | 1.0 | 4.9 | All criteria met. |

