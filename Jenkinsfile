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
              extensions: [[$class: 'CloneOption', depth: 1, honorRefspec: true, noTags: true, shallow: true]]
            ],
            changelog: false,
            poll: false
        script {
          if (sh(script: 'git log -1 --pretty=tformat:%s | grep -qP "^Release v\\d|\\[skip .+?\\]"', returnStatus: true) == 0) {
            env.SKIP_CI = 'true'
          }
        }
      }
    }
    stage('Install') {
      when {
        allOf {
          branch 'master'
          not { environment name: 'SKIP_CI', value: 'true' }
        }
      }
      steps {
        nodejs('node8') {
          sh 'yarn'
        }
      }
    }
    stage('Release') {
      when {
        allOf {
          branch 'master'
          not { environment name: 'SKIP_CI', value: 'true' }
        }
      }
      steps {
        dir('public') {
          deleteDir()
        }
        withCredentials([string(credentialsId: githubCredentialsId, variable: 'GITHUB_TOKEN')]) {
          nodejs('node8') {
            sh '$(npm bin)/gulp release'
          }
        }
      }
    }
  }
}
