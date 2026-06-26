from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Main Portfolio Route
@app.route('/')
def home():
    return render_template('index.html')

# Contact Form API Endpoint (Future scaling ke liye)
@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    
    # Yahan aap apna database logic ya email sending logic add kar sakte hain
    if name and email and message:
        return jsonify({"status": "success", "message": "Inquiry received successfully!"}), 200
    return jsonify({"status": "error", "message": "Missing required fields."}), 400

if __name__ == '__main__':
    app.run(debug=True)
