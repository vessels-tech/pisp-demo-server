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
 - Abhimanyu Kapur <abhi.kapur09@gmail.com>
 --------------
 ******/

import * as Health from '../health'

import * as MojaloopAccounts from './accounts/{ID}'
import * as MojaloopAuthorizations from './authorizations'
import * as MojaloopConsents from './consents'
import * as MojaloopConsentsById from './consents/{ID}'
import * as MojaloopConsentRequestsById from './consentRequests/{ID}'
import * as MojaloopPartiesByTypeAndId from './parties/{Type}/{ID}'
import * as MojaloopPartiesByTypeAndIdError from './parties/{Type}/{ID}/error'
import * as Services from './services'
import * as thirdpartyRequests from './thirdpartyRequests'

export const apiHandlers = {
  HealthGet: Health.get,

  UpdateAccountsByUserId: MojaloopAccounts.put,
  UpdateAccountsByUserIdError: MojaloopAccounts.putError,

  AuthorizationsPostRequest: MojaloopAuthorizations.post,
  
  UpdateConsentRequest: MojaloopConsentRequestsById.put,
  NotifyErrorConsentRequests: MojaloopConsentRequestsById.putError,
  
  PostConsents: MojaloopConsents.post,
  PutConsentByID: MojaloopConsentsById.put,
  NotifyErrorConsents: MojaloopConsentsById.putError,
  PatchConsentByID: MojaloopConsentsById.patch,

  PartiesByTypeAndID2: MojaloopPartiesByTypeAndId.put,
  PartiesErrorByTypeAndID: MojaloopPartiesByTypeAndIdError.put,
  UpdateThirdPartyTransactionRequests: thirdpartyRequests.put,
  ThirdpartyTransactionRequestsError: thirdpartyRequests.putError,
  NotifyThirdpartyTransactionRequests: thirdpartyRequests.patch,

  PutServicesByServiceType: Services.put,
}