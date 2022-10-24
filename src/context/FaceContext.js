import React, { createContext } from 'react';
import { useState } from 'react';

const FaceContext = createContext();

export function FaceProvider({ children }) {
    
    const [input, setInput] = useState('');
    const onInputChange = (event) => {
        setInput(event.target.value)
    }
    const [imageUrl, setImageUrl] = useState('');
    const [box, setBox] = useState({});
    const displayFaceBox = (box) => { setBox({box}); }
    const calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById("inputimage");   // ITT LEHET, HOGY PROBLEMA LESZ A GETELEMENT-TEL...
        const width = Number(image.width);
        const height = Number(image.height);
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - (clarifaiFace.right_col * width),
            bottomRow: height - (clarifaiFace.bottom_row * height)
        }
    }
    const onButtonSubmit = () => { 
        setImageUrl({input});
        fetch("https://api.clarifai.com/v2/models/face-detection/outputs", 
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Key 6bd9ec1395374d018a21713e749aa83f'
          },
          body:
          JSON.stringify({
            "user_app_id": {
                "user_id": "clarifai",
                "app_id": "main"
            },
          "inputs": [
            {
              "data": {
                "image": {
                  "url":  {input}
                }
              }
            }
          ]
        })
        })
            .then(response => response.json())
            .then(response => displayFaceBox(calculateFaceLocation(response)))
            .catch(error => console.log('error', error));
    }

    const [user, setUser] = useState({ id:'', name:'', email:'', entries: 0, joined: ''});
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [route, setRoute] = useState('signin');
    
    const loadUser = (data) => {
        setUser({ id: data.id, name: data.name, email: data.email, entries: data.entries, joined: data.joined })
      }
    
    const onRouteChange = (route) => {
    if (route === 'signout') {
        setIsSignedIn(false)
    } else if (route === 'home') {
        setIsSignedIn(true)
    }
    setRoute('route');
    }
    
    const [name, setName] = useState;
    const [email, setEmail] = useState;
    const [password, setPassword] = useState;
    const onNameChange = (event) => { setName(event.target.value) };
    const onEmailChange = (event) => { setEmail(event.target.value) };
    const onPasswordChange = (event) => { setPassword(event.target.value) };
    const onSubmitSignIn= () => {
        fetch('http://localhost:3000/register', {
            method: 'post',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({email}, {password}, {name})
        })
        .then(response => response.json())
        .then(user => {
            if (user) {
                loadUser(user)
                onRouteChange('home');
            }
        })
    };

    const [signInEmail, setSignInEmail] = useState(''); 
    const [signInPassword, setSignInPassword] = useState('');

    const onSIEmailChange = (event) => { setSignInEmail(event.target.value)};
    const onSIPasswordChange = (event) => { setSignInPassword(event.target.value)};
    const onSISubmitSignIn = () => {
        fetch('http://localhost:3000/signin', {
            method: 'post',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                email: {signInEmail},
                password: {signInPassword}
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data === 'success') {
                onRouteChange('home');
            }
        })
    }

    return (
        <FaceContext.Provider
            value={{
                input, setInput,
                onInputChange, onButtonSubmit,
                imageUrl, setImageUrl,
                user, setUser, loadUser,
                isSignedIn, setIsSignedIn,
                route, setRoute, onRouteChange,
                box, setBox,
                name, onNameChange, setName,
                email, onEmailChange, setEmail, 
                password, onPasswordChange, setPassword, onSubmitSignIn,
                signInEmail, setSignInEmail, signInPassword, setSignInPassword, onSIEmailChange, onSIPasswordChange, onSISubmitSignIn
                   }}>
                { children }
        </FaceContext.Provider>
    );
}

export default FaceContext;