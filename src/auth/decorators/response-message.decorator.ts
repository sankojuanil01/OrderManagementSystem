
import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'response_message';

export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);








// setMetadata is a built-in nestjs function
// it attaches metadata to a controller or route handler

// RESPONSE_MESSAGE_KEY a constant's name
// response_message : the actual string used as the metadata key 

// ResponseMessage is the custom decorator
// message : is the value you pass to the decorator  

// SetMetaData() : stores that value as metadata on the controller method or class 