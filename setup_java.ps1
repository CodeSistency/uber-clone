# Script to set up Java 17 for the current session
$java17Path = "C:\Program Files\OpenLogic\jdk-17.0.13.11-hotspot\bin"

# Set environment variables for this session
$env:JAVA_HOME = "C:\Program Files\OpenLogic\jdk-17.0.13.11-hotspot"
$env:PATH = "$java17Path;$env:PATH"

Write-Host "Java 17 configured for this session"
Write-Host "JAVA_HOME: $env:JAVA_HOME"

# Test Java version
java -version

