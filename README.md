#------------------------201-Scheduler------------------------  

### Requirements
##### For Building:
* Tomcat 9
* Java 8

##### For Developing:
* Eclipse (with Java EE support)
* Maven (install on Linux via any package manager, on Mac via Homebrew with `brew install maven`, or on Windows via [Chocolatey](https://chocolatey.org/install) with `choco install maven`)
* lombok (if using Eclipse, [install lombok](https://www.vogella.com/tutorials/Lombok/article.html#lombok-eclipse) and then restart Eclipse)
* MongoDB (install on Linux via any package manager, on Mac via Homebrew with `brew install mongodb`, or on Windows via [Chocolatey](https://chocolatey.org/install) with `choco install mongodb`)

### Deployment
Initial deployment will take a few minutes to download all the dependencies.
##### Step 1: Compile
On Unix:
```bash
./mvnw package
java -jar target/*.jar
```  
On Windows: Run the file called "mvnw.cmd"
##### Step 2: Navigate to the site.
Go to localhost:8080 in your browser. That's it!

### Development
When making changes to the source code, it's easier to launch the website directly from Spring by entering `./mvnw spring-boot:run`.