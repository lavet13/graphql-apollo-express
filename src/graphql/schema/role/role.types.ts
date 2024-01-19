import gql from 'graphql-tag';

export default gql`
  type Query {
    roles: [Role!]
  }

  type Role {
    id: ID!
    name: String!
    users: [User!]
  }
`;
