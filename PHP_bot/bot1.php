<?php
/**
 * Copyright 2016 LINE Corporation
 *
 * LINE Corporation licenses this file to you under the Apache License,
 * version 2.0 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
require_once('./LINEBotTiny.php');
require_once('./secretSave.php');

$channelAccessToken = $line_channelAccessToken;
$channelSecret = $line_channelSecret;
$client = new LINEBotTiny($channelAccessToken, $channelSecret);

foreach ($client->parseEvents() as $event) {
    switch ($event['type']) {
        case 'message':
            $message = $event['message'];
            $returnMsgObj = [];
            //$stringExport = strval(var_export($event, TRUE));
            $stringExport = "event=>\n\n".json_encode($event, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
            $returnExport = [
                'type' => 'text',
                'text' => $stringExport
            ];
            switch ($message['type']) {
                case 'text':
                    $returnMsgText = $message['text'];
                    $returnMsgObj = [$returnExport, [
                        'type' => 'text',
                        'text' => $returnMsgText
                    ]];
                break;
                case "image":
                case "video":
                case "audio":
                case "file":
                case "location":
                case "sticker":
                case "follow":
                    $returnMsgText = "You send a message that type is ".$message['type'];
                    $returnMsgObj = [$returnExport, [
                        'type' => 'text',
                        'text' => $returnMsgText
                    ]];
                break;
                default:
                    error_log('Unsupported message type: ' . $message['type']);
                break;
            }
            //Reply Message bt client method
            $client->replyMessage([
                'replyToken' => $event['replyToken'],
                'messages' => $returnMsgObj
            ]);
            break;
        default:
            error_log('Unsupported event type: ' . $event['type']);
            break;
    }
};
?>