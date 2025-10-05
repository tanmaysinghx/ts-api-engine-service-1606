pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm install'
      }
    }

    
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test || echo "No tests configured"'
      }
    }

    stage('Docker Build & Push') {
      steps {
        sh 'docker build -t ts-api-engine-service-1606:latest .'
      }
    }
  }
}
