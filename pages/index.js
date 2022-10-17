import React from "react";
import "../firebaseConfig";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import axios from "axios";

const auth = getAuth(); 
class App extends React.Component {
  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };
  state = {
    flag: false,
  };
  configureCaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          this.onSignInSubmit();
        },
        defaultCountry: "IN",
      },
      auth
    );
  };
  onSignInSubmit = (e) => {
    e.preventDefault();
    this.configureCaptcha();
    const phoneNumber = "+91" + this.state.mobile;
    const appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        this.setState({
          flag: true,
        });
        window.confirmationResult = confirmationResult;
        // ...
      })
      .catch((error) => {
        console.log(error);
        // Error; SMS not sent
        // ...
      });
  };
  onSubmitOTP = (e) => {
    e.preventDefault();
    const code = this.state.otp;

    confirmationResult
      .confirm(code)
      .then((result) => {
        // User signed in successfully.
        const user = result.user;
        user.getIdToken().then((idToken) => {
          const options = {
            method: "GET",
            // url: "https://epvitechbackenddev.herokuapp.com/sessionlogin",
            url: "https://epvitechbackendprod.herokuapp.com/sessionlogin",
            headers: {
              "Access-Control-Allow-Origin": "*",
              gettoken: idToken,
            },
          };
          axios
            .request(options)
            .then(function (response) {
              const queryString = window.location.search;
              const urlParams = new URLSearchParams(queryString);
              let state = urlParams.get("state");
              let redirect_uri = urlParams.get("redirect_uri");
              window.location = `${redirect_uri}/?state=${state}&code=${result.user.uid}`;
            })
            .catch(function (error) {
              console.error(error);
            });
        });
        // ...
      })
      .catch((error) => {
        alert(error);
      });
  };
  render() {
    return (
      <>
        <div className="container">
          <h2>Phone Number</h2>
          <form onSubmit={this.onSignInSubmit}>
            <div id="sign-in-button"></div>
            <input
              type="number"
              id="number"
              name="mobile"
              placeholder="Enter 10 digit mobile number"
              required
              onChange={this.handleChange}
            />
            <button type="submit" id="send">
              Submit
            </button>
          </form>

          {this.state.flag ? (
            <>
              <h2>Enter OTP</h2>
              <form onSubmit={this.onSubmitOTP}>
                <input
                  type="number"
                  id="verificationcode"
                  name="otp"
                  placeholder="OTP Number"
                  required
                  onChange={this.handleChange}
                />
                <button type="submit" id="verify">
                  Submit
                </button>
              </form>
            </>
          ) : null}
        </div>
        <style jsx>{`
      *{
        font-family:
      }
      .container {
position: absolute;
/* width:50vw; */
margin-top: 20vh;
margin-left:23vw;
}
#number, #verificationcode {
width:50vw;
padding: 10px;
font-size: 20px;
margin-bottom: 5px;
outline: none;
border:1px solid black;
border-radius: 5px;
}
#recaptcha-container {
display: flex;
justify-content: center;
margin-bottom: 10px;
margin-top: 10px;
}
#send, #verify {
width:51.5vw;
height: 40px;
border: none;
border-radius: 5px;
background-color: #1565C0;
color:white;
font-size: 16px;
cursor: pointer;
margin-top: 10px;
}

@media only screen and (max-width: 600px) {
.container{
  margin:auto;
  top:30vh;
}
#number,#verificationcode{
width:89vw;
}
#send,#verify{
width:95vw;
}
`}</style>
      </>
    );
  }
}
export default App;
