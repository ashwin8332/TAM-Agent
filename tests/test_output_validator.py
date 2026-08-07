"""Quick offline unit tests for the output validator — no Ollama required."""
from src.ai.output_validator import validate_and_repair

PASS = "\033[32mPASS\033[0m"
FAIL = "\033[31mFAIL\033[0m"
results = []

def check(label: str, cond: bool, detail: str = ""):
    mark = PASS if cond else f"{FAIL}: {detail}"
    print(f"  {label}: {mark}")
    results.append(cond)

# 1. Valid JSON
v = '{"product":"DataBridge Pro","product_area":"Connectors","issue_category":"Bug","urgency_tier":"P2","urgency_reasoning":"prod down","recommended_team":"Senior Engineering Support","draft_first_response":"Hi thank you"}'
parsed, ok, err = validate_and_repair(v)
check("Valid JSON", ok, err)

# 2. JSON wrapped in code fence
fenced = '```json\n{"product":"CloudSync","product_area":"SSO","issue_category":"Bug","urgency_tier":"P1","urgency_reasoning":"all users locked out","recommended_team":"Escalation Engineering","draft_first_response":"We are on it."}\n```'
_, ok2, err2 = validate_and_repair(fenced)
check("Code fence extraction", ok2, err2)

# 3. Preamble + JSON
preamble = 'Here is the JSON output:\n{"product":"AnalyticsHub","product_area":"Dashboard","issue_category":"Performance","urgency_tier":"P3","urgency_reasoning":"slow queries","recommended_team":"Platform Engineering","draft_first_response":"Thanks for reporting"}'
_, ok3, err3 = validate_and_repair(preamble)
check("Preamble + JSON", ok3, err3)

# 4. Invalid urgency
bad = '{"product":"SecureVault","product_area":"Key Mgmt","issue_category":"Bug","urgency_tier":"CRITICAL","urgency_reasoning":"x","recommended_team":"T1","draft_first_response":"Hi"}'
_, ok4, _ = validate_and_repair(bad)
check("Bad urgency rejected", not ok4)

# 5. Empty input rejected
_, ok5, _ = validate_and_repair("")
check("Empty input rejected", not ok5)

# 6. Missing required field
missing = '{"product":"DataBridge Pro","urgency_tier":"P2","urgency_reasoning":"x","recommended_team":"T1","draft_first_response":"Hi"}'
_, ok6, _ = validate_and_repair(missing)
check("Missing fields rejected", not ok6)

# 7. Category with concatenated urgency gets normalized ("Bug P1" -> "Bug")
concat = '{"product":"DataBridge Pro","product_area":"Connectors","issue_category":"Bug P1","urgency_tier":"P1","urgency_reasoning":"prod down","recommended_team":"Senior Engineering Support","draft_first_response":"Hi thank you"}'
parsed7, ok7, err7 = validate_and_repair(concat)
check("Category normalization (Bug P1 -> Bug)", ok7 and parsed7.get("issue_category") == "Bug", err7)

# 8. Genuinely invalid category still rejected
bad_cat = '{"product":"DataBridge Pro","product_area":"Connectors","issue_category":"Not A Real Category","urgency_tier":"P1","urgency_reasoning":"x","recommended_team":"T1","draft_first_response":"Hi"}'
_, ok8, _ = validate_and_repair(bad_cat)
check("Invalid category rejected", not ok8)

print()
passed = sum(results)
total = len(results)
print(f"Results: {passed}/{total} passed")
if passed < total:
    raise SystemExit(1)
