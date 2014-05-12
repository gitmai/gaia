/* global debug */
/* exported SmsManager */
'use strict';

function SmsManager(sms, configuration) {
  this.sms = sms;
  this.isBalance = false;
  this.isConfirmation = false;
  this.isError = false;
  this.configuration = configuration;
  this.balanceData = undefined;
}

SmsManager.prototype.smsHasValidSender = function() {
  return (
    (this.configuration.balance &&
      Array.isArray(this.configuration.balance.senders) &&
      this.configuration.balance.senders.indexOf(this.sms.sender) > -1) ||
    (this.configuration.topup &&
      Array.isArray(this.configuration.topup.senders) &&
      this.configuration.topup.senders.indexOf(this.sms.sender) > -1)
  );
};

SmsManager.prototype.parseSms = function() {
  debug('Trying to recognize balance SMS'+this.configuration.balance.regexp);
  var description = new RegExp(this.configuration.balance.regexp);
  var balanceData = this.sms.body.match(description);

  if (!balanceData) {
    debug('Trying to recognize zero balance SMS');
    // Some carriers use another response messages format for zero balance
    var zeroDescription = this.configuration.balance.zero_regexp ?
      new RegExp(this.configuration.balance.zero_regexp) : null;
    if (zeroDescription && zeroDescription.test(this.sms.body)) {
      balanceData = ['0.00', '0', '0'];
    }
  }

  this.isBalance = !!balanceData;

  if (!this.isBalance || balanceData.length < 2) {
    console.warn('Impossible to parse balance message.');

    debug('Trying to recognize TopUp confirmation SMS');
    description = new RegExp(this.configuration.topup.confirmation_regexp);
    this.isConfirmation = !!this.sms.body.match(description);

    if (!this.isConfirmation) {
      console.warn('Impossible to parse TopUp confirmation message.');
      debug('Trying to recognize TopUp error SMS');
      description = new RegExp(this.configuration.topup.incorrect_code_regexp);
      this.isError = !!this.sms.body.match(description);
      if (!this.isError) {
        console.warn('Impossible to parse TopUp confirmation msg.');
      }
    }
  } else {
    debug(JSON.stringify(balanceData));
    this.balanceData = balanceData;
  }
};

SmsManager.prototype.isUnexpectedSms = function() {
  this.parseSms(this.configuration);
  return (!this.isBalance && !this.isConfirmation && !this.isError);
};

SmsManager.prototype.removeSms = function() {
  if ('mozMobileMessage' in window.navigator) {
    var mobileMessageManager = window.navigator.mozMobileMessage;
    mobileMessageManager.delete(this.sms.id);
  }
};


