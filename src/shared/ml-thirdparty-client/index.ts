/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 * Google
 - Steven Wijaya <stevenwjy@google.com>
 - Raman Mangla <ramanmangla@google.com>
 - Abhimanyu Kapur <abhi.kapur09@gmail.com>

 * Crosslake
 - Lewis Daly <lewisd@crosslaketech.com>

 --------------
 ******/
/* istanbul ignore file */

import { Simulator } from '~/shared/ml-thirdparty-simulator'
import { PartyIdType } from './models/core'
import { Options } from './options'

import {
  thirdparty as tpAPI
} from '@mojaloop/api-snippets'

import {
  ThirdPartyTransactionRequest,
} from './models/openapi'

import SDKStandardComponents, {
  Logger,
  ThirdpartyRequests,
  MojaloopRequests,
  BaseRequestConfigType,
} from '@mojaloop/sdk-standard-components'
import { NotImplementedError } from '../errors'


// MojaloopClient interface, which can be implemented by either a real client, or simulated one.
export interface MojaloopClient {

  /**
   * Looks up a list of dfsps who are available to link with
   * @param idValue 
   * @param destParticipantId 
   */
  getServices(
    type: string
  ): Promise<unknown>


  /**
   * Looks up a list of accounts with a specific DFSP based
   * on an opaque identifier
   * 
   * @param idValue - The opaque identifier known to the DFSP
   * @param destParticipantId - The DFSP who the user selected to link with
   * 
   */
  getAccounts(
    idValue: string,
    destParticipantId: string
    ): Promise<unknown>



  /**
  * Performs a lookup for a party with the given identifier.
  *
  * @param idType     the type of party identifier
  * @param idValue    the party identifier
  * @param idSubValue optional sub value for the identifier
  */
  getParties(
    idType: PartyIdType,
    idValue: string,
    idSubValue?: string
  ): Promise<unknown>

  /**
   * Performs a request for a new consent
   *
   * @param requestBody         an consent request object as defined by the Mojaloop API.
   * @param destParticipantId   ID of destination - to be used when sending request
   */
  postConsentRequests(
    requestBody: tpAPI.Schemas.ConsentRequestsPostRequest,
    destParticipantId: string
  ): Promise<unknown>


  /**
   * Updates a ConsentRequest with an authToken
   *
   * @param requestBody         an consent request object as defined by the Mojaloop API.
   * @param destParticipantId   ID of destination - to be used when sending request
   */
  patchConsentRequests(
    consentRequestId: string,
    requestBody: tpAPI.Schemas.ConsentRequestsIDPatchRequest,
    destParticipantId: string
  ): Promise<unknown>
  
  /**
   * Performs a put request with registered consent credential
   *
   * @param consentId     identifier of consent as defined by Mojaloop API.
   * @param requestBody         an object to authenticate consent as defined by the Mojaloop API.
   * @param destParticipantId   ID of destination - to be used when sending request
   */
  putConsentId(
    consentId: string,
    requestBody: tpAPI.Schemas.ConsentsIDPutResponseSigned | tpAPI.Schemas.ConsentsIDPutResponseVerified,
    destParticipantId: string
  ): Promise<unknown> 

  /**
  * Performs a transaction initiation with the given transaction request object.
  *
  * @param _requestBody a transaction request object as defined by the Mojaloop API.
  */
  postTransactions(
    requestBody: ThirdPartyTransactionRequest,
    destParticipantId: string
  ): Promise<unknown>

  /**
  * Performs a transaction authorization with the given authorization object.
  *
  * @param id              a transaction request id that corresponds with the
  *                        authorization.
  * @param requestBody     an authorization object as defined by the Mojaloop API.
  * @param destParticipantId   ID of destination - to be used when sending request
  */
  putAuthorizations(
    id: string,
    requestBody: tpAPI.Schemas.ThirdpartyRequestsTransactionsIDAuthorizationsPutResponse,
    destParticipantId: string
  ): Promise<unknown>
}

/**
 * A client object that abstracts out operations that could be performed in
 * Mojaloop. With this, a service does not need to directly specify the request
 * endpoint, body, params, and headers that are required to talk with the
 * Mojaloop APIs. Instead, the service implementation could just pass the necessary
 * config upon initialization and relevant information in the function parameters
 * when it wants to perform a certain operation.
 */

export class Client implements MojaloopClient{
  /**
   * An optional simulator that is expected to be passed when using the
   * simulator plugin.
   */
  simulator?: Simulator

  /**
   * An object that is provided by the Mojaloop SDK to handle all
   * of the necessary setup to make API calls to the admin API of Mojaloop.
   */
  mojaloopRequests: MojaloopRequests

  /**
   * An object that is provided by the Mojaloop SDK to handle all
   * of the necessary setup to make API calls to the third-party API of Mojaloop.
   */
  thirdpartyRequests: ThirdpartyRequests

  /**
   * An object that keeps the configuration for the client.
   */
  private options: Options

  /**
   * Constructor for the Mojaloop client.
   *
   * @param options a configuration object for the client.
   */
  public constructor(options: Options) {
    this.options = options

    const fspiopRequestsConfig: BaseRequestConfigType = {
      dfspId: this.options.participantId,
      logger: new Logger.Logger(),
      jwsSign: false,
      tls: {
        mutualTLS: { enabled: false },
        creds: {
          ca: '',
          cert: ''
        }
      },
      peerEndpoint: this.options.endpoints.fspiop,
      resourceVersions: {
        // override parties here, since the ttk doesn't have config for 1.1
        parties: {
          contentVersion: '1.0',
          acceptVersion: '1.0'
        }
      }
    }

    const thirdpartyRequestsConfig: BaseRequestConfigType = {
      dfspId: this.options.participantId,
      logger: new Logger.Logger(),
      jwsSign: false,
      tls: {
        mutualTLS: { enabled: false },
        creds: {
          ca: '',
          cert: ''
        }
      },
      peerEndpoint: this.options.endpoints.thirdparty,
      resourceVersions: {
        // override parties here, since the ttk doesn't have config for 1.1
        parties: {
          contentVersion: '1.0',
          acceptVersion: '1.0'
        }
      }
    }

    this.thirdpartyRequests = new ThirdpartyRequests(thirdpartyRequestsConfig)
    this.mojaloopRequests = new MojaloopRequests(fspiopRequestsConfig)
  }
  
  getServices( type: string): Promise<unknown> {
    return this.thirdpartyRequests.getServices(type)
  }

  getAccounts(userId: string, destParticipantId: string): Promise<unknown> {
    return this.thirdpartyRequests.getAccounts(userId, destParticipantId)
  }

  /**
   * Performs a lookup for a party with the given identifier.
   *
   * @param _type  the type of party identifier
   * @param _id    the party identifier
   */
  public async getParties(
    idType: PartyIdType,
    idValue: string,
    idSubValue?: string
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
    if (idSubValue) {
      return this.mojaloopRequests.getParties(idType, idValue, idSubValue)
    }
    return this.mojaloopRequests.getParties(idType, idValue)
  }

  /**
   * Performs a transaction initiation with the given transaction request object.
   *
   * @param _requestBody a transaction request object as defined by the Mojaloop API.
   */
  public async postTransactions(
    requestBody: ThirdPartyTransactionRequest,
    destParticipantId: string
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
    // TODO: this will need some updating
    return this.thirdpartyRequests.postThirdpartyRequestsTransactions(
      (requestBody as unknown) as tpAPI.Schemas.ThirdpartyRequestsTransactionsPostRequest,
      destParticipantId
    )
  }

  /**
   * Performs a transaction authorization with the given authorization object.
   *
   * @param id              a transaction request id that corresponds with the
   *                        authorization.
   * @param requestBody     an authorization object as defined by the Mojaloop API.
   * @param destParticipantId   ID of destination - to be used when sending request

   */
  public async putAuthorizations(
    id: string,
    requestBody: tpAPI.Schemas.ThirdpartyRequestsTransactionsIDAuthorizationsPutResponse,
    destParticipantId: string
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {

    // const requestBody = {
    //   authenticationInfo: {
    //     // LD - just a hack because we need to update the TTK
    //     authentication: 'OTP',
    //     // authenticationValue: {
    //     //   pinValue: _requestBody.value,
    //     //   counter: "1"
    //     // }
    //     // TODO: this looks outdated now.
    //     authenticationValue: _requestBody.authenticationInfo?.authenticationValue
    //     // authenticationValue: 'TODO: valid authentication value',
    //   },
    //   responseType: 'ENTERED'
    // }

    // @ts-ignore
    // return this.mojaloopRequests.putAuthorizations(id, requestBody, destParticipantId)
    // TODO: fix this hack - we should be using PUT /thirdpartyRequests/authorizations/{id}
    // return this.thirdpartyRequests._put(`authorizations/${id}`, 'authorizations', requestBody, destParticipantId)
    return this.thirdpartyRequests.putThirdpartyRequestsTransactionsAuthorizations(
      requestBody, id, destParticipantId)
  }

  /**
   * Gets a list of PISP/DFSP participants
   */
  public async getParticipants(): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
    // TODO: Add once implemented in sdk-standard components
    // Placeholder below
    throw new NotImplementedError()
  }

  /**
   * Performs a request for a new consent
   *
   * @param requestBody         an consent request object as defined by the Mojaloop API.
   * @param destParticipantId   ID of destination - to be used when sending request
   */
  public async postConsentRequests(
    requestBody: tpAPI.Schemas.ConsentRequestsPostRequest,
    destParticipantId: string
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
    return this.thirdpartyRequests.postConsentRequests(
      requestBody,
      destParticipantId
    )
  }

  /**
   * Performs a put request with authenticated consent request
   *
   * @param consentRequestId    unique identifier of the consent request
   * @param requestBody         an object to authenticate consent as defined by the Mojaloop API.
   * @param destParticipantId   ID of destination - to be used when sending request
   */
  public async putConsentRequests(
    consentRequestId: string,
    requestBody: tpAPI.Schemas.ConsentRequestsIDPutResponseOTP |
      tpAPI.Schemas.ConsentRequestsIDPutResponseWeb,
    destParticipantId: string
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
    return this.thirdpartyRequests.putConsentRequests(
      consentRequestId,
      requestBody,
      destParticipantId
    )
  }

  public async patchConsentRequests(
    consentRequestId: string,
    requestBody: tpAPI.Schemas.ConsentRequestsIDPatchRequest,
    destParticipantId: string
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined > {
    return this.thirdpartyRequests.patchConsentRequests(
      consentRequestId,
      requestBody,
      destParticipantId
    )
  }

  /**
   * Performs a put request with registered consent credential
   *
   * @param consentId     identifier of consent as defined by Mojaloop API.
   * @param requestBody         an object to authenticate consent as defined by the Mojaloop API.
   * @param destParticipantId   ID of destination - to be used when sending request
   */
  public async putConsentId(
    consentId: string,
    requestBody: tpAPI.Schemas.ConsentsIDPutResponseSigned | tpAPI.Schemas.ConsentsIDPutResponseVerified,
    destParticipantId: string
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
    return this.thirdpartyRequests.putConsents(
      consentId,
      requestBody,
      destParticipantId
    )
  }

  /**
   * Performs a request to revoke the Consent object and unlink
   *
   * @param _consentId     identifier of consent as defined by Mojaloop API.
   * @param destParticipantId   ID of destination - to be used when sending request
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async postRevokeConsent(
    _consentId: string,
    _destParticipantId: string
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
    // TODO: Add once implemented in sdk-standard components
    // Placeholder below
    throw new NotImplementedError()
  }
}

export default Client