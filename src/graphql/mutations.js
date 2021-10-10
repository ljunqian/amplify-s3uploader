/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createFile = /* GraphQL */ `
  mutation CreateFile(
    $input: CreateFileInput!
    $condition: ModelfileConditionInput
  ) {
    createFile(input: $input, condition: $condition) {
      id
      title
      description
      filepath
      like
      owner
      createdAt
      updatedAt
    }
  }
`;
export const updateFile = /* GraphQL */ `
  mutation UpdateFile(
    $input: UpdateFileInput!
    $condition: ModelfileConditionInput
  ) {
    updateFile(input: $input, condition: $condition) {
      id
      title
      description
      filepath
      like
      owner
      createdAt
      updatedAt
    }
  }
`;
export const deleteFile = /* GraphQL */ `
  mutation DeleteFile(
    $input: DeleteFileInput!
    $condition: ModelfileConditionInput
  ) {
    deleteFile(input: $input, condition: $condition) {
      id
      title
      description
      filepath
      like
      owner
      createdAt
      updatedAt
    }
  }
`;
