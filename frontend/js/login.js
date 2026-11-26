
const COGNITO_DOMAIN =
    "https://ap-south-1ob6tzakyd.auth.ap-south-1.amazoncognito.com";

const CLIENT_ID = "5cei6e2oofai765ta7jbv9tk44";

const REDIRECT_URI = window.location.origin + window.location.pathname;
const loginButton = document.getElementById("loginButton");

// Generate a secure random string for PKCE
function generateRandomString(length = 64) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

    const randomValues = crypto.getRandomValues(
        new Uint8Array(length)
    );

    return Array.from(randomValues)
        .map(value => chars[value % chars.length])
        .join("");
}

// Convert bytes to Base64 URL format
function base64UrlEncode(bytes) {
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

// Create PKCE challenge
async function createCodeChallenge(verifier) {
    const data = new TextEncoder().encode(verifier);

    const digest = await crypto.subtle.digest("SHA-256", data);

    return base64UrlEncode(new Uint8Array(digest));
}

// Start Cognito login
async function startLogin() {
    const verifier = generateRandomString();
    const state = generateRandomString(32);

    sessionStorage.setItem("pkce_verifier", verifier);
    sessionStorage.setItem("oauth_state", state);

    const challenge = await createCodeChallenge(verifier);

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        scope: "openid email phone",
        redirect_uri: REDIRECT_URI,
        code_challenge_method: "S256",
        code_challenge: challenge,
        state: state
    });

    window.location.href =
        `${COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`;
}

// Handle Cognito callback
async function handleLoginCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const returnedState = params.get("state");
    const error = params.get("error");

    if (error) {
        alert("Login failed: " + (params.get("error_description") || error));
        return;
    }

    if (!code) return;

    const savedState = sessionStorage.getItem("oauth_state");
    const verifier = sessionStorage.getItem("pkce_verifier");

    if (!savedState || returnedState !== savedState || !verifier) {
        alert("Login session could not be verified. Please try again.");
        sessionStorage.removeItem("oauth_state");
        sessionStorage.removeItem("pkce_verifier");
        return;
    }

    try {
        const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                client_id: CLIENT_ID,
                code: code,
                redirect_uri: REDIRECT_URI,
                code_verifier: verifier
            })
        });

        const tokens = await response.json();

        if (!response.ok) {
            throw new Error(tokens.error_description || "Token exchange failed");
        }

        sessionStorage.setItem("taskhub_access_token", tokens.access_token);
        sessionStorage.setItem("taskhub_id_token", tokens.id_token);

        sessionStorage.removeItem("oauth_state");
        sessionStorage.removeItem("pkce_verifier");

        window.location.replace("dashboard.html");

    } catch (error) {
        console.error("Cognito login error:", error);
        alert("Unable to complete login. Please try again.");
    }
}

if (loginButton) {
    loginButton.addEventListener("click", startLogin);
}

handleLoginCallback();
