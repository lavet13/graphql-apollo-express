import gql from 'graphql-tag';

export default gql`
  type Role {
    id: ID!
    name: String!
  }
`;
