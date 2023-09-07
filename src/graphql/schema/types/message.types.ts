import gql from 'graphql-tag';

export default gql`
  type Query {
    messages: [Message!]!
    message(id: ID!): Message!
  }

  type Mutation {
    createMessage(text: String!): Message!
    deleteMessage(id: ID!): Boolean!
    updateMessage(id: ID!, text: String!): Message
  }

  type Message {
    id: ID!
    text: String!
    user: User!
  }
`;
