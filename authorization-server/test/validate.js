'use strict';

require('process').env.OAUTHRECIPES_SURPRESS_TRACE = true;

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const utils     = require('../utils');
const validate  = require('../validate');

chai.use(sinonChai);
const expect = chai.expect;


describe('validate', () => {
  describe('#logAndThrow', () => {
    it('should throw a given mesage', () => {
      expect(() => validate.logAndThrow('some message')).to.throw('some message');
    });
  });

  describe('#user', () => {
    it('show throw if user is undefined', () => {
      expect(() => validate.user(undefined, 'pass')).to.throw('User does not exist');
    });

    it('show throw if user is null', () => {
      expect(() => validate.user(null, 'pass')).to.throw('User does not exist');
    });

    it('show throw if password does not match', () => {
      expect(() =>
        validate.user({ password : 'password' }, 'otherpassword'))
        .to.throw('User password does not match');
    });

    it('show return user if password matches', () => {
      expect(validate.user({ password: 'password' }, 'password'))
        .to.eql({ password : 'password' });
    });

    it('show return user if password matches with data', () => {
      expect(validate.user({ user: 'yo', password: 'password' }, 'password'))
        .to.eql({ user : 'yo', password : 'password' });
    });
  });

  describe('#userExists', () => {
    it('show throw if user is undefined', () => {
      expect(() => validate.userExists(undefined)).to.throw('User does not exist');
    });

    it('show throw if user is null', () => {
      expect(() => validate.userExists(null)).to.throw('User does not exist');
    });

    it('show return user if it exists', () => {
      expect(validate.userExists({ password : 'password' }))
        .to.eql({ password : 'password' });
    });
  });

  describe('#client', () => {
    it('show throw if client is undefined', () => {
      expect(() => validate.client(undefined, 'pass')).to.throw('Client does not exist');
    });

    it('show throw if client is null', () => {
      expect(() => validate.client(null, 'pass')).to.throw('Client does not exist');
    });

    it('show throw if client secret does not match', () => {
      expect(() =>
        validate.client({ clientSecret : 'password' }, 'otherpassword'))
        .to.throw('Client secret does not match');
    });

    it('show return client if client secret matches', () => {
      expect(validate.client({ clientSecret : 'password' }, 'password'))
        .to.eql({ clientSecret : 'password' });
    });

    it('show return client if password matches with data', () => {
      expect(validate.client({ client: 'yo', clientSecret: 'password' }, 'password'))
        .to.eql({ client : 'yo', clientSecret : 'password' });
    });
  });

  describe('#clientExists', () => {
    it('show throw if client is undefined', () => {
      expect(() => validate.clientExists(undefined)).to.throw('Client does not exist');
    });

    it('show throw if client is null', () => {
      expect(() => validate.clientExists(null)).to.throw('Client does not exist');
    });

    it('show return user if it exists', () => {
      expect(validate.clientExists({ clientSecret : 'password' }))
        .to.eql({ clientSecret : 'password' });
    });
  });

  describe.skip('#token', () => {
    // TODO
  });

  describe.skip('#refreshToken', () => {
    // TODO
  });

  describe.skip('#authCode', () => {
    // TODO
  });

  describe('#isRefreshToken', () => {
    it('show return true for scope having offline_access', () => {
      expect(validate.isRefreshToken({ scope : 'offline_access' })).to.eql(true);
    });

    it('show return false for scope of other value', () => {
      expect(validate.isRefreshToken({ scope : '*' })).to.eql(false);
    });

    it('show return false for non existent scope', () => {
      expect(validate.isRefreshToken({ })).to.eql(false);
    });
  });

  describe.skip('#generateRefreshToken', () => {
    // TODO
  });

  describe.skip('#generateToken', () => {
    // TODO
  });

  describe.skip('#generateTokens', () => {
    // TODO
  });

  describe('#tokenForHttp', () => {
    it('should return 400 status', () => {
      try {
        validate.tokenForHttp();
      } catch (err) {
        expect(err.status).to.eql(400);
      }
    });

    it('should reject undefined token', () => {
      expect(() => validate.tokenForHttp()).to.throw('invalid_token');
    });

    it('should reject null token`', () => {
      expect(() => validate.tokenForHttp(null)).to.throw('invalid_token');
    });

    it('should reject invalid token', () => {
      expect(() => validate.tokenForHttp('abc')).to.throw('invalid_token');
    });

    it('should work with a valid token', () => {
      const token = utils.createToken();
      expect(validate.tokenForHttp(token)).eql(token);
    });
  });

  describe('#clientExistsForHttp', () => {
    it('should return 400 status', () => {
      try {
        validate.clientExistsForHttp();
      } catch (err) {
        expect(err.status).to.eql(400);
      }
    });

    it('should reject undefined client', () => {
      expect(() => validate.clientExistsForHttp()).to.throw('invalid_token');
    });

    it('should reject null client`', () => {
      expect(() => validate.clientExistsForHttp(null)).to.throw('invalid_token');
    });

    it('should return a non null client', () => {
      const client = validate.clientExistsForHttp({ client: 123 });
      expect(client).eql({ client: 123 });
    });
  });
});

