import gql from 'graphql-tag';

export default gql`
  scalar Date

  type Query {
    users: [User!]
    user(id: ID!): User
    me: User
  }

  type Mutation {
    signUp(username: String!, email: String!, password: String!): Token!
    signIn(login: String!, password: String!): Token!

    deleteUser(id: ID!): Boolean!
  }

  type Token {
    token: String!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    roles: [Role!]
    createdAt: Date!
    updatedAt: Date!
    messages: [Message!]
  }
`;
