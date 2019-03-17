// IMPORTS
import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/theme/eclipse.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/matchbrackets'

import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/lint'
import './jsonlint'
import './App.css'
import example from './example'
import { FaStar } from 'react-icons/fa'
import { FiAlertCircle } from 'react-icons/fi'

import { MdSettingsInputComponent, MdList } from 'react-icons/md'

// API stuff
const API_URL = `https://pkginfo.herokuapp.com/info`

const fetchStuff = pkgname => fetch('/info/react').then(res => res.json())

const getPkgInfo = pkgname =>
  fetch(`${API_URL}/${pkgname}`).then(res => res.json())

// ICONS
const FaAlert = () => <FiAlertCircle />
const DevDep = () => <MdSettingsInputComponent />
const Dep = () => <MdList />

// UTILS
const parseGitRepoUrl = repo => {
  if (repo) {
    const reg = /github.com.*/
    const url = repo.match(reg)
    return `https://${url}`
  }
  return ''
}

const Package = props => {
  console.log(props)
  return (
    <li>
      <h2>
        <a href={parseGitRepoUrl(props.repository)} target="_blank">
          {props.name}
        </a>
      </h2>
      <p>{props.description}</p>
      <p>
        version: {props.version} latest: {props.latest}
      </p>
      <Dep /> {props.dependencies} <DevDep /> {props.devDependencies}
    </li>
  )
}

class App extends Component {
  constructor() {
    super()
    this.state = {
      name: 'CodeMirror',
      code: example,
      pkgs: [],
    }
  }

  updateCode(newCode) {
    this.setState({
      code: newCode,
    })
  }

  // I'm most unsure about implementation of this
  getMyMyPackages = (dependencies = {}) => {
    const deps = Object.keys(dependencies)
    if (deps.length > 0) {
      // clear previous state
      this.setState({ pkgs: [] })
      deps.map(async key => {
        const result = await getPkgInfo(key).catch(e => {})
        this.setState(prevState => {
          return {
            pkgs: [...prevState.pkgs, result],
          }
        })
      })
    }
  }

  render() {
    let jsonCode = {}
    try {
      // TODO: <16-03-19> Marko: get info from codemirro lint is this data valid
      jsonCode = JSON.parse(this.state.code)
    } catch (e) {
      // psssst
    }
    const dependencies = jsonCode.dependencies
    let options = {
      theme: 'monokai',
      lineNumbers: true,
      lint: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      gutters: ['CodeMirror-lint-markers'],
      mode: 'application/json',
    }
    return (
      <div className="wrapper">
        <div className="left">
          <CodeMirror
            value={this.state.code}
            onChange={this.updateCode.bind(this)}
            options={options}
          />
        </div>

        <div className="right">
          <button
            type="click"
            onClick={async () => {
              const result = await fetchStuff().catch(e => {})
              console.log(result)
            }}
          />
          Get Local
          <button
            type="click"
            onClick={() => this.getMyMyPackages(dependencies)}>
            Get
          </button>
          <ul>
            {this.state.pkgs.map(pckg => (
              <Package {...pckg} />
            ))}
          </ul>
        </div>
      </div>
    )
  }
}

export default App
