const {ApolloServer, gql} = require('apollo-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/user');
const Employee = require('./models/employee');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
  }

  type Query {
    login(username: String!, password: String!): User
  }

  type Mutation {
    signup(username: String!, email: String!, password: String!): User
  }



  type Employee {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    salary: Float!
  }

  type Query {
    getEmployees: [Employee]
    searchEmployeeById(id: ID!): Employee
  }

  type Mutation {
    addEmployee(first_name: String!, last_name: String!, email: String!, gender: String!, salary: Float!): Employee
    updateEmployee(id: ID!, first_name: String, last_name: String, email: String, gender: String, salary: Float): Employee
    deleteEmployeeById(id: ID!): String
  }



`;

const resolvers = {
    Query:
        {
            login: async (_, {username, password}) => {
                const user = await User.findOne({username});
                if (!user) {
                    throw new Error('User not found');
                }
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    throw new Error('Incorrect password');
                }
                return user;
            },


            getEmployees: async () => {
                return await Employee.find();
            },

            searchEmployeeById: async (_, {id}) => {
                const employee = await Employee.findById(id);
                if (!employee) {
                    throw new Error('Employee not found');
                }
                return employee;
            },
        },
    Mutation: {
        signup: async (_, {username, email, password}) => {
            const userExists = await User.findOne({$or: [{username}, {email}]});
            if (!username || !email) {
                throw new Error('Username and email are required');
              }
            if (userExists) {
                throw new Error('Username or email already exists');
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            const user = new User({username, email, password: hashedPassword});
            await user.save();
            return user;
        },

        addEmployee: async (_, {first_name, last_name, email, gender, salary}) => {
            const employee = new Employee({first_name, last_name, email, gender, salary});
            if(!first_name){
                throw new Error('First Name required')
            }
            if(!last_name){
                throw new Error('Last Name required')
            }
            if(!email){
                throw new Error('Email required')
            }
            if(!gender){
                throw new Error('Gender required')
            }
            if(!salary){
                throw new Error('Salary required')
            }
            await employee.save();
            return employee;
        },

        updateEmployee: async (_, {id, first_name, last_name, email, gender, salary}) => {
            const employee = await Employee.findById(id);
            if (!employee) {
                throw new Error('Employee not found');
            }
            if (first_name) {
                employee.first_name = first_name;
            }
            if (last_name) {
                employee.last_name = last_name;
            }
            if (email) {
                employee.email = email;
            }
            if (gender) {
                employee.gender = gender;
            }
            if (salary) {
                employee.salary = salary;
            }
            await employee.save();
            return employee;
        },

        deleteEmployeeById: async (_, {id}) => {
            const employee = await Employee.findByIdAndDelete(id);
            if (!employee) {
                throw new Error('Employee not found');
            }
            return 'Employee deleted successfully';
        },

    },
};

const server = new ApolloServer({typeDefs, resolvers});

mongoose
    .connect('mongodb+srv://vinz232:poli1998@assignment1.owb41j9.mongodb.net/?retryWrites=true&w=majority', {useNewUrlParser: true})
    .then(() => {
        server.listen().then(({url}) => {
            console.log(`Server running at ${url}`);
        });
    })
    .catch(error => {
        console.error(error);
    });