// IMPORTS
import React, { Component } from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/theme/eclipse.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/matchbrackets'
import { format } from 'prettier-package-json'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/lint'
import './jsonlint'
import data from './data'
import './App.css'
import Toggle from './Toggle'
import Button from './Button'
import example from './example'

import { Line } from 'react-chartjs-2'

import { NPM, GITHUB } from './icons.js'

// API stuff
const API_URL = process.env.REACT_APP_API_URL
const getPkgInfo = pkgname =>
  fetch(`${API_URL}/${encodeURI(pkgname)}`).then(res => res.json())
// UTILS
const parseGitRepoUrl = repo => {
  if (repo) {
    const reg = /github.com.*/
    const url = repo.match(reg)
    return `https://${url}`
  }
  return ''
}
const Header = ({ dependencies, fetch, isLoading }) => (
  <header>
    <ul className="tg-list">
      <Toggle id="dep" label="Dep" />
      <Toggle id="dev" label="DevDep" />
    </ul>
    <Button
      disabled={isLoading}
      className={isLoading ? 'onclic' : ''}
      handleClick={() => {
        fetch(dependencies)
      }}
    />
  </header>
)
const Package = props => {
  return (
    <li className="results__item">
      <div className="flex">
        <h2 className="results__item-title">{props.name}</h2>
        <section className="results-right">
          <a href={`https://npmjs.org/package/${props.name}`} target="_blank">
            <NPM width="25" className="brand brand-npm" />
          </a>
          <a href={parseGitRepoUrl(props.repository)} target="_blank">
            <GITHUB width="25" className="brand brand-github" />
          </a>
        </section>
      </div>
      <span className="results__item--description">{props.description}</span>
    </li>
  )
}

const hasPackageJson = () =>
  window.location.pathname.length > 4
    ? window.location.pathname.substr(-4) === 'json'
    : false

class App extends Component {
  constructor() {
    super()
    this.state = {
      name: 'CodeMirror',
      isLoading: false,
      code: '',
      pkgs: [],
    }
  }

  componentDidMount() {
    if (hasPackageJson()) {
      fetch(`http://localhost:5000${window.location.pathname}`)
        .then(res => res.text())
        .then(text =>
          this.setState(c => {
            return { code: format(JSON.parse(text), {}) }
          }),
        )
    } else {
      this.setState({ code: example })
    }
  }
  // I'm most unsure about implementation of this
  getMyMyPackages = (dependencies = {}) => {
    const deps = Object.keys(dependencies)
    console.log(deps)
    if (deps.length > 0) {
      // clear previous state
      this.setState(_ => ({
        pkgs: [],
        isLoading: true,
      }))
      deps.map(async (key, i) => {
        const result = await getPkgInfo(key).catch(e => {})
        this.setState(prevState => {
          return {
            pkgs: [...prevState.pkgs, result],
          }
        })
        if (deps.length === this.state.pkgs.length) {
          this.setState({ isLoading: false })
        }
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
            onBeforeChange={(a, b, value) => this.setState({ code: value })}
            options={options}
          />
        </div>

        <div className="right">
          <Header
            dependencies={dependencies}
            isLoading={this.state.isLoading}
            fetch={this.getMyMyPackages}
          />

          <Line data={data} />
          <ul className="results">
            {this.state.pkgs.map((pckg, i) => (
              <Package {...pckg} key={pckg.name} index={i} />
            ))}
          </ul>
        </div>
      </div>
    )
  }
}

export default App
