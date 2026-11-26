
const CLIENT_ID = "5cei6e2oofai765ta7jbv9tk44";

const registerForm = document.getElementById("registerForm");

let registeredEmail = "";

// Register a new user
if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (!name || !email || !password) {
            alert("Please complete all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch(
                "https://cognito-idp.ap-south-1.amazonaws.com/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-amz-json-1.1",
                        "X-Amz-Target": "AWSCognitoIdentityProviderService.SignUp"
                    },
                    body: JSON.stringify({
                        ClientId: CLIENT_ID,
                        Username: email,
                        Password: password,
                        UserAttributes: [
                            { Name: "email", Value: email },
                            { Name: "name", Value: name }
                        ]
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || result.Message || "Registration failed."
                );
            }

            registeredEmail = email;

            registerForm.style.display = "none";

            showVerificationForm();

            alert("Registration successful! Check your email for the verification code.");

        } catch (error) {
            console.error("Registration error:", error);
            alert(error.message || "Unable to register. Please try again.");
        }
    });
}

// Display email verification form
function showVerificationForm() {
    const verificationSection = document.createElement("section");
    verificationSection.id = "verificationSection";

    const heading = document.createElement("h2");
    heading.textContent = "Verify Your Email";

    const message = document.createElement("p");
    message.textContent =
        `Enter the verification code sent to ${registeredEmail}.`;

    const codeInput = document.createElement("input");
    codeInput.type = "text";
    codeInput.id = "verificationCode";
    codeInput.placeholder = "Enter verification code";
    codeInput.autocomplete = "one-time-code";
    codeInput.required = true;

    const verifyButton = document.createElement("button");
    verifyButton.type = "button";
    verifyButton.textContent = "Verify Email";

    verifyButton.addEventListener("click", confirmRegistration);

    verificationSection.append(
        heading,
        message,
        codeInput,
        verifyButton
    );

    registerForm.parentNode.insertBefore(
        verificationSection,
        registerForm.nextSibling
    );
}

// Confirm the user's registration
async function confirmRegistration() {
    const codeInput = document.getElementById("verificationCode");
    const confirmationCode = codeInput.value.trim();

    if (!confirmationCode) {
        alert("Please enter the verification code.");
        return;
    }

    try {
        const response = await fetch(
            "https://cognito-idp.ap-south-1.amazonaws.com/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-amz-json-1.1",
                    "X-Amz-Target": "AWSCognitoIdentityProviderService.ConfirmSignUp"
                },
                body: JSON.stringify({
                    ClientId: CLIENT_ID,
                    Username: registeredEmail,
                    ConfirmationCode: confirmationCode
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || result.Message ||
                "Email verification failed."
            );
        }

        document.getElementById("verificationSection").innerHTML = `
            <h2>Email Verified Successfully!</h2>
            <p>Your TaskHub account is now confirmed.</p>
            <a href="login.html">Continue to Login</a>
        `;

    } catch (error) {
        console.error("Verification error:", error);
        alert(error.message || "Unable to verify your email.");
    }
}
