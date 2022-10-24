import React from 'react';
import { Component } from 'react';
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import './App.css';
import particlesOptions from "./particles.json";
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';

const particlesInit = (main) => {
    loadFull(main);
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  positionClass: false, 
  user: {
    id:'',
    name:'',
    email:'',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
        constructor() {
            super();
            this.state = initialState;
        } 

        loadUser = (data) => {
          this.setState({user:{
            id: data.id,
            name: data.name,
            email: data.email,
            entries: data.entries,
            joined: data.joined 
          }})
        }

        calculateFaceLocation = (data) => {
          const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
          console.log(clarifaiFace, 'vajon');
          const image = document.getElementById("inputimage");
          const width = Number(image.width);
          const height = Number(image.height);
          return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - (clarifaiFace.right_col * width),
            bottomRow: height - (clarifaiFace.bottom_row * height)
          }
        }
    
        displayFaceBox = (box) => {
          this.setState({ box: box});
        }
    
        onInputChange = (event) => {
            this.setState({input:event.target.value});
        }
    
        onButtonSubmit = () => { 
          this.setState({imageUrl: this.state.input});
          console.log(JSON.stringify(this.state.input), 'postman');
          fetch('http://localhost:3000/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            mode: 'no-cors',
            body: JSON.stringify(
              this.state.input
              )
            })
            .then(res => this.displayFaceBox(this.calculateFaceLocation(res)))
            .catch(err => console.log('error', err));
            fetch('http://localhost:3000/image', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                id: this.state.user.id
              })
              })
              .then(res => res.json())
              .then(count => {
                const entries = count.entries;
                console.log(entries);
                this.setState(Object.assign(this.state.user, { entries: entries }))
                // this.setState({user: {entries: entries }})
                // .catch(console.log());
              })
              .catch(err => console.log('error', err));
            }
        

        signTheFuckIn = () => {
          this.setState({isSignedIn: true})
        }

        onRouteChange = (route) => {
          if (route === 'signout') {
            this.setState(initialState)
            this.setState({route: 'signout'})
              } else if (route === 'home') {
              this.setState({isSignedIn: true})
              this.setState({route: 'home'})      
              console.log(route, 'route to home')      
              } else if (route === 'signin') {
                this.setState({isSignedIn: false})
                this.setState({route: 'signin'})
                console.log(route, 'route to signin')      
                } else {
                  this.setState({route: 'register'})
                  this.setState({isSignedIn: false})}
                  console.log(route, 'route to register')      
        }
        
        // componentDidUpdate({entries}, prevState) {
        //   if (prevState.entries !== this.state.entries) {
        //     console.log('pokemons state has changed.')
        //   }
        // }

        render() {
          const { isSignedIn, imageUrl, route, box, entries } = this.state;
          console.log('isSignedIn:', isSignedIn, 'route:', route, 'entries', entries);
          return (
              <div className="App">
                  <Particles options={particlesOptions} init={/* JSON.stringify(this. */particlesInit/* ) */}/>
                  <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
                  <Logo /> 
                  { route === 'home' ?
                    ( <div>
                        <div className='bringUp'>
                          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
                          <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
                          <FaceRecognition box={box} imageUrl={imageUrl} />
                        </div>
                      </div>
                    ) : (
                        (route === 'signin') || (route === 'signout') ? 
                        ( 
                        <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} signTheFuckIn={this.signTheFuckIn}/>
                        ) : (
                        <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                        )
                    )
                  } 
              </div>
          );
        }
    }
    export default App;