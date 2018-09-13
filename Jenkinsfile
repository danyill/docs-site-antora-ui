def gitUrl = 'git@github.com:mulesoft/docs-site-antora-ui'
def gitBranch = 'master'
def gitCredentialsId = 'mule-docs-agent-ssh-key'
def githubCredentialsId = 'mule-docs-agent-github-token'

pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps {
        checkout scm:
            [
              $class: 'GitSCM',
              userRemoteConfigs: [[credentialsId: gitCredentialsId, url: gitUrl]],
              branches: [[name: "refs/heads/${gitBranch}"]],
              extensions: [
                [$class: 'CloneOption', depth: 1, honorRefspec: true, noTags: true, shallow: true],
                [$class: 'MessageExclusion', excludedMessage: '(?s).*(?:Release v\\d+|\\[skip .+?\\]).*']
              ]
            ],
            changelog: false,
            poll: false
      }
    }
    stage('Install') {
      steps {
        nodejs('node8') {
          sh 'yarn'
        }
      }
    }
    stage('Release') {
      steps {
        dir('public') {
          deleteDir()
        }
        withCredentials([string(credentialsId: githubCredentialsId, variable: 'GITHUB_TOKEN')]) {
          nodejs('node8') {
            //sh '$(npm bin)/gulp release'
          }
        }
      }
    }
  }
}
