#!/usr/bin/env python3
"""
REVA PHOENIX CALIBRATION — FIREBASE FIRESTORE SYNC SCRIPT
Populates Cloud Firestore with:
- laboratories (35 labs)
- documents (corporate brochure, certificate, catalog)
- site_images (10 infrastructure & leadership images)
"""

import json
import os
import sys
import urllib.request
import urllib.error

API_KEY = "AIzaSyCNaf3HRvpeBcx1HmdsL_B3hh0whhDJVEY"
PROJECT_ID = "calibration-51865"
DATABASE = "(default)"
ADMIN_EMAIL = "admin@revaphoenix.com"
ADMIN_PASSWORD = "reva2026"

def get_auth_token():
    """Sign in as admin to obtain ID token."""
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"
    payload = json.dumps({
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
        "returnSecureToken": True
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("idToken")
    except urllib.error.HTTPError as e:
        print(f"[Auth Error] {e.code}: {e.read().decode('utf-8')}")
        return None

def to_firestore_value(val):
    if val is None:
        return {"nullValue": None}
    elif isinstance(val, bool):
        return {"booleanValue": val}
    elif isinstance(val, int):
        return {"integerValue": str(val)}
    elif isinstance(val, float):
        return {"doubleValue": val}
    elif isinstance(val, str):
        return {"stringValue": val}
    elif isinstance(val, list):
        return {"arrayValue": {"values": [to_firestore_value(x) for x in val]}}
    elif isinstance(val, dict):
        return {"mapValue": {"fields": {k: to_firestore_value(v) for k, v in val.items()}}}
    return {"stringValue": str(val)}

def write_document(collection, doc_id, data_dict, auth_token):
    fields = {k: to_firestore_value(v) for k, v in data_dict.items() if v is not None}
    body = json.dumps({"fields": fields}).encode("utf-8")
    url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/{DATABASE}/documents/{collection}/{doc_id}?key={API_KEY}"
    
    headers = {"Content-Type": "application/json"}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
        
    req = urllib.request.Request(url, data=body, headers=headers, method="PATCH")
    try:
        with urllib.request.urlopen(req) as resp:
            return True, None
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        return False, f"HTTP {e.code}: {err_msg}"

def main():
    print(f"[*] Authenticating with Firebase Auth ({ADMIN_EMAIL})...")
    token = get_auth_token()
    if not token:
        print("[!] Trying unauthenticated request (in case Firestore rules allow public write)...")

    # Load data/site_database.json
    db_path = os.path.join(os.path.dirname(__file__), "..", "data", "site_database.json")
    if not os.path.exists(db_path):
        print(f"[!] Database file not found at {db_path}")
        return

    with open(db_path, "r", encoding="utf-8") as f:
        site_db = json.load(f)

    # 1. Sync Laboratories
    labs = site_db.get("laboratories", [])
    print(f"\n[*] Syncing {len(labs)} Laboratories to Firestore collection 'laboratories'...")
    success_count = 0
    err_sample = None
    for lab in labs:
        doc_id = str(lab.get("id"))
        ok, err = write_document("laboratories", doc_id, lab, token)
        if ok:
            success_count += 1
        else:
            err_sample = err

    print(f"[*] Laboratories sync: {success_count}/{len(labs)} succeeded.")
    if err_sample and success_count == 0:
        print(f"[!] Sample Error: {err_sample}")

    # 2. Sync Documents
    resources = site_db.get("content", {}).get("resources", [])
    print(f"\n[*] Syncing {len(resources)} Documents to Firestore collection 'documents'...")
    doc_success = 0
    for doc in resources:
        doc_id = str(doc.get("id"))
        ok, err = write_document("documents", doc_id, doc, token)
        if ok:
            doc_success += 1

    print(f"[*] Documents sync: {doc_success}/{len(resources)} succeeded.")

    # 3. Sync Site Images
    images = site_db.get("siteImages", [])
    print(f"\n[*] Syncing {len(images)} Site Images to Firestore collection 'site_images'...")
    img_success = 0
    for img in images:
        doc_id = str(img.get("id"))
        ok, err = write_document("site_images", doc_id, img, token)
        if ok:
            img_success += 1

    print(f"[*] Site Images sync: {img_success}/{len(images)} succeeded.")

    if success_count > 0:
        print("\n[SUCCESS] Cloud Firestore now contains your documents and images!")
    else:
        print("\n[NOTE] Firestore returned a permission error.")
        print("Please visit Firebase Console -> Cloud Firestore -> Rules, change the rule to:")
        print("  rules_version = '2';")
        print("  service cloud.firestore {")
        print("    match /databases/{database}/documents {")
        print("      match /{document=**} {")
        print("        allow read, write: if true;")
        print("      }")
        print("    }")
        print("  }")
        print("Then re-run this script!")

if __name__ == "__main__":
    main()
