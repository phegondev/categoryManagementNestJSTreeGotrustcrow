# TREE DB STRUCTURE EXAMPLE IN NEST.JS
## STEPS TO SET UP THE PROJECT

### 1 clone the porject 
### 2 Open the project on your device(Laptop or Computer)
### 3 Checkout to the master branch
### 4 Open the src/db/databaseConfig.ts
### 5 Replace the existing credentials with your postgress credential and create a database on your db named "category_management"
### 6 Make sure you are on the root of the project where the package.json is. You can confirm by running 'ls' on your terminal/command if you are using macos or linux os but if you are on windows use 'ls'. This is to co firm if you are on the project root folder
### 7 Run "npm i" to install the dependencies of the project
### 8 Run the application by runing "npm run start:dev" to start the application on development mode
### Open your terminal to see the logs(if you on localhost) The logs will tell if it is sucessfully run


## STEPS TO TEST AND RUN THE APPLICATION

### A Simple DOCUMENTATION OF THE PROJECT LINK: https://documenter.getpostman.com/view/26661848/2s9YymFj3n
### NOTE:  After you have successfully run the project, if you are on localhost here is the api url with doc for testing is : http://localhost:4040/api
### NOTE: if you deployed the applkcation, the api url with doc for testing is url will be: http://yourserverurl:4040/api


### The project have 7 API.
### If you are on localhost, the base url is http://localhost:4040/categories


#### 1. API to add a category: http://localhost:4040/categories
##### Methos Post, Body{"name":"value"} or {"name":"parent", "parentId":parent_id_number} 

#### 2. API to get all categories: http://localhost:4040/categories
##### Methos Get, No parameter

#### 3. API to get a single category by id: http://localhost:4040/categories/single/{id}
##### Methos Get, {id} is the id of the category we want to get

#### 4. API to Get a category and its first descendant by ID: http://localhost:3000/categories/with-first-direct-children/{id}
##### Methos Get, {id} is the id of the category we want to get

#### 5. API to Get a category and all descendants by ID: http://localhost:4040/categories/with-all-children/{id}
##### Methos Get, {id} is the id of the category we want to get

#### 6. API to delete a category by id: http://localhost:4040/categories/remove/{id}
##### Methos Get, {id} is the id of the category we want to get

#### 7. API to move a category subtree from one node to another: http://localhost:4040/categories/move-subtree/{sourceId}/to/{destinationParentId}
##### Methos PUT, {sourceId} is the id of the category we want to move and destinationParentId is the id of the node we want to move it to


