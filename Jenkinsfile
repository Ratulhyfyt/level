pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Install') {
      steps { sh 'npm ci --legacy-peer-deps' }
    }
    stage('Test') {
      steps { sh 'npm test' }
    }
    stage('Docker Build') {
      steps { sh 'docker build -t node-express-devops-sample:jenkins .' }
    }
  }
  post {
    always {
      junit allowEmptyResults: true, testResults: 'junit.xml'
    }
  }
}
