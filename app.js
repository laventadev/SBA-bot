from flask import Flask, request
import requests

app = Flask(__name__)

CLIENT_ID = "1423994613458272268"  # Your Discord client ID
CLIENT_SECRET = "UY7BSFn1rFyVlS6wyv9uNbtJ_DoMUM0_"  # Your Discord client secret
REDIRECT_URI = "https://commentvalidery.replit.sba/auth/discord"  # Your redirect URI

@app.route("/")
def index():
    return f"""
    <h2>Discord OAuth2 Demo</h2>
    <a href="https://discord.com/oauth2/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code&scope=identify">Login with Discord</a>
    """

@app.route("/auth/discord")
def discord_auth():
    code = request.args.get("code")
    if not code:
        return "No code provided", 400

    # Exchange code for access token
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "scope": "identify"
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    token_response = requests.post("https://discord.com/api/oauth2/token", data=data, headers=headers)
    token_json = token_response.json()

    access_token = token_json.get("access_token")
    if not access_token:
        return f"Error getting access token: {token_json}", 400

    # Get user info
    user_response = requests.get("https://discord.com/api/users/@me", headers={
        "Authorization": f"Bearer {access_token}"
    })
    user_json = user_response.json()

    return f"""
    <h2>Logged in as {user_json.get('username')}#{user_json.get('discriminator')}</h2>
    <p>ID: {user_json.get('id')}</p>
    <img src="https://cdn.discordapp.com/avatars/{user_json.get('id')}/{user_json.get('avatar')}.png" alt="avatar" />
    """

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
