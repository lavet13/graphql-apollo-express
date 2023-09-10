import gql from 'graphql-tag';

export default gql`
  scalar Date

  type Query {
    users: [User!]
    user(id: ID!): User
    me: User
  }

  type User {
    id: ID!
    username: String!
    createdAt: Date!
    updatedAt: Date!
    messages: [Message!]
  }
`;
