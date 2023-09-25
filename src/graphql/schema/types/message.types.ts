import gql from 'graphql-tag';

export default gql`
  type Query {
    messages(
      first: Int
      after: String
      last: Int
      before: String
    ): MessageConnection!
    message(id: ID!): Message!
  }

  type MessageConnection {
    totalCount: Int!
    edges: [MessageEdge!]!
    pageInfo: PageInfo!
  }

  type MessageEdge {
    cursor: String!
    node: Message!
  }

  type PageInfo {
    startCursor: String
    endCursor: String
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
  }

  type Mutation {
    createMessage(text: String!, receiverId: ID!): Message!
    deleteMessage(id: ID!): Boolean!
    updateMessage(id: ID!, text: String!): [Int!]
  }

  type Message {
    id: ID!
    text: String!
    createdAt: Date!
    updatedAt: Date!
    receiver: User!
    sender: User!
  }
`;
