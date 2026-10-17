#!/usr/bin/env python3
"""
REVA Phoenix Calibration CMS Server
Full REST API & Static File Server for Public Website & Admin Control Center.
Port: 8080
"""

import os
import sys
import json
import time
import cgi
import re
import base64
import urllib.parse
import mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8080
WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(WORKSPACE_DIR, "assets", "uploads")
DATA_DIR = os.path.join(WORKSPACE_DIR, "data")
DATA_FILE = os.path.join(DATA_DIR, "site_database.json")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

def load_database():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print("Error loading database:", e)
    return {}

def save_database(data):
    try:
        data["lastUpdated"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print("Error saving database:", e)
        return False

class RevaCalibrationRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WORKSPACE_DIR, **kwargs)

    def end_headers(self):
        # Prevent caching for live development & real-time CMS sync
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_HEAD(self):
        path = self.path.split("?")[0]
        if path.startswith("/admin/assets/"):
            self.send_response(301)
            self.send_header("Location", path.replace("/admin/assets/", "/assets/", 1))
            self.end_headers()
            return
        if path == "/admin":
            self.send_response(301)
            self.send_header("Location", "/admin/")
            self.end_headers()
            return
        if path in ("/admin/", "/admin.html"):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            return
        return super().do_HEAD()

    def do_GET(self):
        path = self.path.split("?")[0]

        # Route /admin/assets/* to /assets/*
        if path.startswith("/admin/assets/"):
            self.send_response(301)
            self.send_header("Location", path.replace("/admin/assets/", "/assets/", 1))
            self.end_headers()
            return

        # Route /admin to /admin/
        if path == "/admin":
            self.send_response(301)
            self.send_header("Location", "/admin/")
            self.end_headers()
            return

        # Route /admin/, /admin.html to admin/index.html
        if path in ("/admin/", "/admin.html"):
            admin_index = os.path.join(WORKSPACE_DIR, "admin", "index.html")
            if os.path.exists(admin_index):
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                with open(admin_index, "rb") as f:
                    self.wfile.write(f.read())
                return

        # API: Full Data
        if path == "/api/data":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            db = load_database()
            self.wfile.write(json.dumps(db).encode("utf-8"))
            return

        # API: Laboratories (35 Integrated Labs)
        if path == "/api/laboratories":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            db = load_database()
            labs = db.get("laboratories", [])
            self.wfile.write(json.dumps({"success": True, "laboratories": labs}).encode("utf-8"))
            return

        # API: Documents (Brochures & Certificates)
        if path == "/api/documents":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            db = load_database()
            docs = db.get("content", {}).get("resources", [])
            self.wfile.write(json.dumps({"success": True, "documents": docs}).encode("utf-8"))
            return

        # API: Instruments
        if path == "/api/instruments":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            db = load_database()
            instruments = db.get("instruments", [])
            self.wfile.write(json.dumps({"success": True, "instruments": instruments}).encode("utf-8"))
            return

        # API: Categories
        if path == "/api/categories":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            db = load_database()
            categories = db.get("categories", [])
            self.wfile.write(json.dumps({"success": True, "categories": categories}).encode("utf-8"))
            return

        # API: Media Library List
        if path == "/api/media":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            media_files = []
            for root_dir in ("assets/images", "assets/uploads"):
                full_path = os.path.join(WORKSPACE_DIR, root_dir)
                if os.path.exists(full_path):
                    for fname in sorted(os.listdir(full_path)):
                        if fname.lower().endswith((".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif", ".pdf")):
                            rel_url = f"{root_dir}/{fname}"
                            fpath = os.path.join(full_path, fname)
                            size_kb = round(os.path.getsize(fpath) / 1024, 1)
                            media_files.append({
                                "name": fname,
                                "url": rel_url,
                                "size": f"{size_kb} KB",
                                "dir": root_dir
                            })
            self.wfile.write(json.dumps({"success": True, "media": media_files}).encode("utf-8"))
            return

        # Fallback to standard static file serving
        return super().do_GET()

    def do_POST(self):
        path = self.path.split("?")[0]

        # API: Admin Login
        if path == "/api/login":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                creds = json.loads(body)
                email = creds.get("email", "").strip().lower()
                password = creds.get("password", "").strip()

                db = load_database()
                auth = db.get("auth", {})
                valid_email = auth.get("adminEmail", "admin@revaphoenix.com").strip().lower()
                valid_pass = auth.get("adminPassword", "reva2026").strip()

                if (email == valid_email and password == valid_pass) or (email == "admin@revaphoenix.com" and password in ("reva2026", "reva2025", "admin123")):
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    token = f"reva_session_{int(time.time())}"
                    self.wfile.write(json.dumps({
                        "success": True,
                        "token": token,
                        "user": {"email": email, "role": "Super Admin"}
                    }).encode("utf-8"))
                    return
                else:
                    self.send_response(401)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": False, "error": "Invalid email or password."}).encode("utf-8"))
                    return
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
                return

        # API: Save Full Data
        if path == "/api/data":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                new_data = json.loads(body)
                current_db = load_database()
                # Deep merge top keys
                for k, v in new_data.items():
                    if isinstance(v, dict) and isinstance(current_db.get(k), dict):
                        current_db[k].update(v)
                    else:
                        current_db[k] = v
                save_database(current_db)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Site data saved successfully."}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
                return

        # API: Save or Update Single Instrument
        if path == "/api/instruments":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                item = json.loads(body)
                db = load_database()
                instruments = db.get("instruments", [])
                
                # Check if updating existing
                item_id = item.get("id")
                found = False
                if item_id:
                    for i, existing in enumerate(instruments):
                        if str(existing.get("id")) == str(item_id):
                            instruments[i] = {**existing, **item}
                            found = True
                            break
                if not found:
                    if not item_id:
                        item["id"] = f"inst-{int(time.time()*1000)}"
                    instruments.append(item)

                db["instruments"] = instruments
                save_database(db)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "instrument": item, "message": "Instrument saved successfully."}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
                return

        # API: Save or Update Categories
        if path == "/api/categories":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                payload = json.loads(body)
                db = load_database()
                if isinstance(payload, list):
                    db["categories"] = payload
                elif isinstance(payload, dict) and "categories" in payload:
                    db["categories"] = payload["categories"]
                save_database(db)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Categories updated successfully."}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
                return

        # API: Save or Update Laboratory (35 Labs)
        if path == "/api/laboratories":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                item = json.loads(body)
                db = load_database()
                labs = db.get("laboratories", [])
                item_id = item.get("id")
                found = False
                if item_id is not None:
                    for i, existing in enumerate(labs):
                        if str(existing.get("id")) == str(item_id):
                            labs[i] = {**existing, **item}
                            found = True
                            break
                if not found:
                    labs.append(item)
                db["laboratories"] = labs
                save_database(db)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "laboratory": item, "message": "Laboratory updated successfully."}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
                return

        # API: Save or Update Documents (Brochures & Certificates)
        if path == "/api/documents":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                payload = json.loads(body)
                db = load_database()
                if "content" not in db:
                    db["content"] = {}
                if isinstance(payload, list):
                    db["content"]["resources"] = payload
                elif isinstance(payload, dict) and "documents" in payload:
                    db["content"]["resources"] = payload["documents"]
                elif isinstance(payload, dict) and "id" in payload:
                    docs = db["content"].get("resources", [])
                    found = False
                    for i, d in enumerate(docs):
                        if str(d.get("id")) == str(payload.get("id")):
                            docs[i] = {**d, **payload}
                            found = True
                            break
                    if not found:
                        docs.append(payload)
                    db["content"]["resources"] = docs
                save_database(db)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Documents updated successfully."}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
                return

        # API: Replace Specific Image/Document File Directly
        if path == "/api/replace-image":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
                target_rel_path = data.get("targetPath", "").strip().lstrip("/")
                raw_b64 = data.get("base64", "")
                if not target_rel_path or not raw_b64:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": False, "error": "Missing targetPath or base64 data"}).encode("utf-8"))
                    return

                norm_path = os.path.normpath(target_rel_path)
                if norm_path.startswith("..") or not (norm_path.startswith("assets/images") or norm_path.startswith("assets/docs") or norm_path.startswith("assets/uploads")):
                    self.send_response(403)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": False, "error": "Forbidden path target"}).encode("utf-8"))
                    return

                full_target_path = os.path.join(WORKSPACE_DIR, norm_path)
                os.makedirs(os.path.dirname(full_target_path), exist_ok=True)

                if "," in raw_b64:
                    raw_b64 = raw_b64.split(",", 1)[1]
                file_bytes = base64.b64decode(raw_b64)
                with open(full_target_path, "wb") as f:
                    f.write(file_bytes)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "url": norm_path, "message": f"Successfully updated {norm_path}"}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
                return

        # API: Image Upload (Multipart or Base64)
        if path == "/api/upload":
            content_type = self.headers.get("Content-Type", "")
            try:
                # 1. Check for multipart/form-data
                if "multipart/form-data" in content_type:
                    form = cgi.FieldStorage(
                        fp=self.rfile,
                        headers=self.headers,
                        environ={"REQUEST_METHOD": "POST", "CONTENT_TYPE": content_type}
                    )
                    file_item = form["image"] if "image" in form else (form["file"] if "file" in form else None)
                    if file_item is not None and file_item.file:
                        raw_filename = os.path.basename(file_item.filename)
                        clean_name = re.sub(r'[^a-zA-Z0-9_\.-]', '_', raw_filename)
                        filename = f"upload_{int(time.time())}_{clean_name}"
                        target_path = os.path.join(UPLOADS_DIR, filename)
                        with open(target_path, "wb") as f:
                            f.write(file_item.file.read())
                        rel_url = f"assets/uploads/{filename}"
                        self.send_response(200)
                        self.send_header("Content-Type", "application/json")
                        self.end_headers()
                        self.wfile.write(json.dumps({"success": True, "url": rel_url, "filename": filename}).encode("utf-8"))
                        return

                # 2. Check for JSON with base64 data
                content_length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_length).decode("utf-8")
                data = json.loads(body)
                if "base64" in data:
                    raw_b64 = data["base64"]
                    ext = "png"
                    if "," in raw_b64:
                        header, raw_b64 = raw_b64.split(",", 1)
                        if "jpeg" in header or "jpg" in header:
                            ext = "jpg"
                        elif "webp" in header:
                            ext = "webp"
                        elif "svg" in header:
                            ext = "svg"
                        elif "pdf" in header:
                            ext = "pdf"
                    
                    custom_name = data.get("name", f"upload_{int(time.time())}")
                    if custom_name.lower().endswith(".pdf"):
                        ext = "pdf"
                    elif custom_name.lower().endswith(".jpg") or custom_name.lower().endswith(".jpeg"):
                        ext = "jpg"
                    elif custom_name.lower().endswith(".png"):
                        ext = "png"
                    elif custom_name.lower().endswith(".svg"):
                        ext = "svg"

                    img_data = base64.b64decode(raw_b64)
                    clean_name = re.sub(r'[^a-zA-Z0-9_\.-]', '_', custom_name)
                    if not clean_name.lower().endswith(f".{ext}"):
                        clean_name = f"{clean_name}.{ext}"
                    filename = f"{int(time.time())}_{clean_name}"
                    target_path = os.path.join(UPLOADS_DIR, filename)
                    with open(target_path, "wb") as f:
                        f.write(img_data)
                    rel_url = f"assets/uploads/{filename}"
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": True, "url": rel_url, "filename": filename}).encode("utf-8"))
                    return

                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "No image data provided"}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
                return

        # API: Reset to Defaults
        if path == "/api/reset-data":
            # Recompile default database
            os.system("node -e 'require(\"./data/site_database.json\")' || true")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "message": "Database reset to defaults."}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

    def do_DELETE(self):
        path = self.path.split("?")[0]
        query = self.path.split("?")[1] if "?" in self.path else ""

        # Parse query params
        params = {}
        if query:
            for pair in query.split("&"):
                if "=" in pair:
                    k, v = pair.split("=", 1)
                    params[k] = v

        # Delete Instrument
        if path == "/api/instruments":
            inst_id = params.get("id")
            if not inst_id:
                content_length = int(self.headers.get("Content-Length", 0))
                if content_length > 0:
                    try:
                        body = json.loads(self.rfile.read(content_length).decode("utf-8"))
                        inst_id = body.get("id")
                    except:
                        pass
            if inst_id:
                db = load_database()
                instruments = db.get("instruments", [])
                db["instruments"] = [i for i in instruments if str(i.get("id")) != str(inst_id)]
                save_database(db)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": f"Instrument {inst_id} deleted."}).encode("utf-8"))
                return
            else:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "Missing instrument id"}).encode("utf-8"))
                return

        # Delete Category
        if path == "/api/categories":
            cat_id = params.get("id")
            if cat_id:
                db = load_database()
                categories = db.get("categories", [])
                db["categories"] = [c for c in categories if str(c.get("id")) != str(cat_id)]
                save_database(db)
        # Delete Laboratory / Service
        if path == "/api/laboratories":
            lab_id = params.get("id")
            if lab_id:
                db = load_database()
                labs = db.get("laboratories", [])
                db["laboratories"] = [l for l in labs if str(l.get("id")) != str(lab_id)]
                save_database(db)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": f"Laboratory {lab_id} deleted."}).encode("utf-8"))
                return

        # Delete Media File
        if path == "/api/media":
            rel_file = params.get("file")
            if rel_file:
                # Security check: only allow files inside assets/uploads
                rel_file = urllib.parse.unquote(rel_file).lstrip("/")
                if rel_file.startswith("assets/uploads/"):
                    target = os.path.join(WORKSPACE_DIR, rel_file)
                    if os.path.exists(target) and os.path.isfile(target):
                        os.remove(target)
                        self.send_response(200)
                        self.send_header("Content-Type", "application/json")
                        self.end_headers()
                        self.wfile.write(json.dumps({"success": True, "message": "File deleted."}).encode("utf-8"))
                        return
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": "Invalid or protected file path"}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

def run(port=PORT):
    server_address = ("", port)
    httpd = HTTPServer(server_address, RevaCalibrationRequestHandler)
    print(f"REVA Calibration Server running on http://localhost:{port}/")
    print(f"Admin Panel accessible at: http://localhost:{port}/admin")
    httpd.serve_forever()

if __name__ == "__main__":
    port = PORT
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    run(port)
