# Fix Java PATH configuration
$currentPath = [System.Environment]::GetEnvironmentVariable('PATH', [System.EnvironmentVariableTarget]::User)
$java17Bin = 'C:\Program Files\OpenLogic\jdk-17.0.13.11-hotspot\bin'

if ($currentPath -notlike "*$java17Bin*") {
    $newPath = $java17Bin + ';' + $currentPath
    [System.Environment]::SetEnvironmentVariable('PATH', $newPath, [System.EnvironmentVariableTarget]::User)
    Write-Host "Java 17 added to PATH"
} else {
    Write-Host "Java 17 already in PATH"
}

# Verify configuration
Write-Host "JAVA_HOME: $([System.Environment]::GetEnvironmentVariable('JAVA_HOME', [System.EnvironmentVariableTarget]::User))"
Write-Host "PATH contains Java 17: $([System.Environment]::GetEnvironmentVariable('PATH', [System.EnvironmentVariableTarget]::User) -like '*jdk-17*')"

