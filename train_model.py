import numpy as np
import json
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, roc_auc_score, recall_score, precision_score, confusion_matrix
from sklearn.preprocessing import LabelEncoder

np.random.seed(42)
n = 5000

# Features: severity (0-3), component_type (0-4), bus_age (years), mileage (10k km), days_since_service, status (0-1)
severity       = np.random.choice([0,1,2,3], n, p=[0.3,0.35,0.25,0.10])
component_type = np.random.choice([0,1,2,3,4], n, p=[0.25,0.20,0.25,0.15,0.15])
bus_age        = np.random.uniform(1, 15, n)
mileage        = np.random.uniform(5, 80, n)
days_since_svc = np.random.uniform(0, 180, n)
status         = np.random.choice([0,1], n, p=[0.6,0.4])

X = np.column_stack([severity, component_type, bus_age, mileage, days_since_svc, status])

# Label: failure likely if high severity, old bus, or high mileage
prob_failure = (
    0.10
    + 0.20 * (severity / 3)
    + 0.12 * (component_type == 0)   # brake
    + 0.10 * (component_type == 1)   # engine
    + 0.08 * (bus_age / 15)
    + 0.07 * (mileage / 80)
    + 0.05 * (days_since_svc / 180)
    + 0.08 * status
    + np.random.normal(0, 0.05, n)
)
y = (prob_failure > 0.35).astype(int)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

model = LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)
model.fit(X_train, y_train)

y_pred  = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:,1]

f1        = round(f1_score(y_test, y_pred), 3)
auc       = round(roc_auc_score(y_test, y_proba), 3)
recall    = round(recall_score(y_test, y_pred), 3)
precision = round(precision_score(y_test, y_pred), 3)
cm        = confusion_matrix(y_test, y_pred).tolist()

output = {
    "intercept": round(float(model.intercept_[0]), 6),
    "coef": [round(float(c), 6) for c in model.coef_[0]],
    "features": ["severity", "component_type", "bus_age", "mileage", "days_since_service", "status"],
    "metrics": {
        "f1": f1, "auc": auc, "recall": recall, "precision": precision,
        "trainSamples": len(X_train), "testSamples": len(X_test)
    },
    "confusionMatrix": {
        "trueNegative": cm[0][0], "falsePositive": cm[0][1],
        "falseNegative": cm[1][0], "truePositive": cm[1][1]
    }
}

print(json.dumps(output, indent=2))
