import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

export interface Campaign {
  cid: anchor.BN;
  creator: PublicKey;
  title: string;
  description: string;
  imageUrl: string;
  goal: anchor.BN;
  amountRaised: anchor.BN;
  timestamp: anchor.BN;
  donors: anchor.BN;
  withdrawals: anchor.BN;
  balance: anchor.BN;
  active: boolean;
}

export interface ProgramState {
  initialized: boolean;
  campaignCount: anchor.BN;
  platformFee: anchor.BN;
  platformAddress: PublicKey;
}

export interface Transaction {
  owner: PublicKey;
  cid: anchor.BN;
  amount: anchor.BN;
  timestamp: anchor.BN;
  credited: boolean;
}

export const CROWDFUNDING_PROGRAM_ID = new PublicKey(
  "CeS7WEPrgnfvgLrVPw3BmTDkt9hz6Cu9oUb1ZPjCMymm"
);

export const IDL = {
  "address": "CeS7WEPrgnfvgLrVPw3BmTDkt9hz6Cu9oUb1ZPjCMymm",
  "metadata": {
    "name": "crowdfunding",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createCampaign",
      "discriminator": [
        111,
        131,
        187,
        98,
        160,
        193,
        114,
        244
      ],
      "accounts": [
        {
          "name": "programState",
          "writable": true
        },
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "imageUrl",
          "type": "string"
        },
        {
          "name": "goal",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deleteCampaign",
      "discriminator": [
        223,
        105,
        48,
        131,
        88,
        27,
        249,
        227
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cid",
          "type": "u64"
        }
      ]
    },
    {
      "name": "donate",
      "discriminator": [
        121,
        186,
        218,
        211,
        73,
        70,
        196,
        180
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "transaction",
          "writable": true
        },
        {
          "name": "donor",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cid",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "programState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "deployer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "updateCampaign",
      "discriminator": [
        235,
        31,
        39,
        49,
        121,
        173,
        19,
        92
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cid",
          "type": "u64"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "imageUrl",
          "type": "string"
        },
        {
          "name": "goal",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updatePlatformSettings",
      "discriminator": [
        213,
        238,
        2,
        39,
        128,
        157,
        3,
        95
      ],
      "accounts": [
        {
          "name": "updater",
          "writable": true,
          "signer": true
        },
        {
          "name": "programState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newPlatformFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  109,
                  112,
                  97,
                  105,
                  103,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "transaction",
          "writable": true
        },
        {
          "name": "programState",
          "writable": true
        },
        {
          "name": "platformAddress",
          "writable": true
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cid",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "campaign",
      "discriminator": [
        50,
        40,
        49,
        11,
        157,
        220,
        229,
        192
      ]
    },
    {
      "name": "programState",
      "discriminator": [
        77,
        209,
        137,
        229,
        149,
        67,
        167,
        230
      ]
    },
    {
      "name": "transaction",
      "discriminator": [
        11,
        24,
        174,
        129,
        203,
        117,
        242,
        23
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "alreadyInitialized",
      "msg": "The program has already been initialized."
    },
    {
      "code": 6001,
      "name": "titleTooLong",
      "msg": "Title exceeds the maximum length of 64 characters."
    },
    {
      "code": 6002,
      "name": "descriptionTooLong",
      "msg": "Description exceeds the maximum length of 512 characters."
    },
    {
      "code": 6003,
      "name": "imageUrlTooLong",
      "msg": "Image URL exceeds the maximum length of 256 characters."
    },
    {
      "code": 6004,
      "name": "invalidGoalAmount",
      "msg": "Invalid goal amount. Goal must be greater than zero."
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "Unauthorized access."
    },
    {
      "code": 6006,
      "name": "campaignNotFound",
      "msg": "Campaign not found."
    },
    {
      "code": 6007,
      "name": "inactiveCampaign",
      "msg": "Campaign is inactive."
    },
    {
      "code": 6008,
      "name": "invalidDonationAmount",
      "msg": "Donation amount must be at least 1 SOL."
    },
    {
      "code": 6009,
      "name": "campaignGoalActualized",
      "msg": "Campaign goal reached."
    },
    {
      "code": 6010,
      "name": "invalidWithdrawalAmount",
      "msg": "Withdrawal amount must be at least 1 SOL."
    },
    {
      "code": 6011,
      "name": "insufficientFund",
      "msg": "Insufficient funds in the campaign."
    },
    {
      "code": 6012,
      "name": "invalidPlatformAddress",
      "msg": "The provided platform address is invalid."
    },
    {
      "code": 6013,
      "name": "invalidPlatformFee",
      "msg": "Invalid platform fee percentage."
    }
  ],
  "types": [
    {
      "name": "campaign",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cid",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "imageUrl",
            "type": "string"
          },
          {
            "name": "goal",
            "type": "u64"
          },
          {
            "name": "amountRaised",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "donors",
            "type": "u64"
          },
          {
            "name": "withdrawals",
            "type": "u64"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "active",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "programState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "campaignCount",
            "type": "u64"
          },
          {
            "name": "platformFee",
            "type": "u64"
          },
          {
            "name": "platformAddress",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "transaction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "cid",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "credited",
            "type": "bool"
          }
        ]
      }
    }
  ]
} as const;