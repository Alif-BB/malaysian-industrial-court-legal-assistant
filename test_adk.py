from google.adk.web.app import app
print("ADK Web Routes:")
for r in app.routes:
    print(r.path)
