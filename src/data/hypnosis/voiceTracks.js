/* ------------------------------------------------------------------
   voiceTracks.js — FICHIER GÉNÉRÉ, NE PAS ÉDITER À LA MAIN
   ------------------------------------------------------------------
   Produit par scripts/generate-hypnosis-voice.mjs à partir de
   src/data/hypnosis/sessions.js et de voix neuronales françaises
   (Microsoft Edge « Read Aloud »). Les MP3 sont embarqués dans
   public/media/hypnosis/voix/ : la voix est donc identique sur tous
   les appareils, douce et humaine, et fonctionne 100 % hors-ligne.

   Régénérer :  node scripts/generate-hypnosis-voice.mjs
------------------------------------------------------------------- */

export const VOICE_GENERATED_AT = "2026-11-17T22:45:21.017Z"

export const VOICE_ENGINE = "Voix neuronales françaises (Microsoft Edge)"

export const NEURAL_VOICES = [
  {
    "id": "denise",
    "label": "Denise",
    "gender": "Femme",
    "voice": "fr-FR-DeniseNeural",
    "color": "#cfa851",
    "description": "Voix féminine douce, chaude et posée. La plus apaisante des deux : idéale pour l'induction, la détente et le sommeil."
  },
  {
    "id": "henri",
    "label": "Henri",
    "gender": "Homme",
    "voice": "fr-FR-HenriNeural",
    "color": "#4a7fd4",
    "description": "Voix masculine grave et très stable. Un accompagnement rassurant pour l'ancrage, le focus et la visualisation."
  }
]

export const VOICE_SAMPLE = {
  "denise": "./media/hypnosis/voix/denise/sample.mp3",
  "henri": "./media/hypnosis/voix/henri/sample.mp3"
}

export const VOICE_TOTALS = {
  "denise": {
    "seconds": 945.88,
    "bytes": 5675472,
    "lines": 113
  },
  "henri": {
    "seconds": 923.02,
    "bytes": 5538096,
    "lines": 113
  }
}

export const VOICE_TRACKS = {
  "denise": {
    "hy-induction": {
      "accueil": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/accueil-00.mp3",
            "seconds": 9.98,
            "bytes": 59904
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/accueil-01.mp3",
            "seconds": 8.26,
            "bytes": 49536
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/accueil-02.mp3",
            "seconds": 5.71,
            "bytes": 34272
          }
        ],
        "seconds": 23.95,
        "bytes": 143712
      },
      "induction": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/induction-00.mp3",
            "seconds": 9.36,
            "bytes": 56160
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/induction-01.mp3",
            "seconds": 13.92,
            "bytes": 83520
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/induction-02.mp3",
            "seconds": 12.19,
            "bytes": 73152
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/induction-03.mp3",
            "seconds": 8.57,
            "bytes": 51408
          }
        ],
        "seconds": 44.04,
        "bytes": 264240
      },
      "approfondissement": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/approfondissement-00.mp3",
            "seconds": 10.75,
            "bytes": 64512
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/approfondissement-01.mp3",
            "seconds": 9.7,
            "bytes": 58176
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/approfondissement-02.mp3",
            "seconds": 9.55,
            "bytes": 57312
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/approfondissement-03.mp3",
            "seconds": 6.07,
            "bytes": 36432
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/approfondissement-04.mp3",
            "seconds": 7.44,
            "bytes": 44640
          }
        ],
        "seconds": 43.51,
        "bytes": 261072
      },
      "suggestion": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/suggestion-00.mp3",
            "seconds": 10.75,
            "bytes": 64512
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/suggestion-01.mp3",
            "seconds": 7.9,
            "bytes": 47376
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/suggestion-02.mp3",
            "seconds": 6.26,
            "bytes": 37584
          }
        ],
        "seconds": 24.91,
        "bytes": 149472
      },
      "emergence": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/emergence-00.mp3",
            "seconds": 9.84,
            "bytes": 59040
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/emergence-01.mp3",
            "seconds": 14.71,
            "bytes": 88272
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-induction/emergence-02.mp3",
            "seconds": 6.74,
            "bytes": 40464
          }
        ],
        "seconds": 31.29,
        "bytes": 187776
      }
    },
    "hy-escalier": {
      "accueil": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/accueil-00.mp3",
            "seconds": 11.06,
            "bytes": 66384
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/accueil-01.mp3",
            "seconds": 4.78,
            "bytes": 28656
          }
        ],
        "seconds": 15.84,
        "bytes": 95040
      },
      "induction": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/induction-00.mp3",
            "seconds": 10.39,
            "bytes": 62352
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/induction-01.mp3",
            "seconds": 5.57,
            "bytes": 33408
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/induction-02.mp3",
            "seconds": 7.27,
            "bytes": 43632
          }
        ],
        "seconds": 23.23,
        "bytes": 139392
      },
      "approfondissement": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/approfondissement-00.mp3",
            "seconds": 4.08,
            "bytes": 24480
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/approfondissement-01.mp3",
            "seconds": 5.83,
            "bytes": 34992
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/approfondissement-02.mp3",
            "seconds": 6,
            "bytes": 36000
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/approfondissement-03.mp3",
            "seconds": 7.34,
            "bytes": 44064
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/approfondissement-04.mp3",
            "seconds": 5.71,
            "bytes": 34272
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/approfondissement-05.mp3",
            "seconds": 6.7,
            "bytes": 40176
          }
        ],
        "seconds": 35.66,
        "bytes": 213984
      },
      "ancrage": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/ancrage-00.mp3",
            "seconds": 12.82,
            "bytes": 76896
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/ancrage-01.mp3",
            "seconds": 9.43,
            "bytes": 56592
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/ancrage-02.mp3",
            "seconds": 8.81,
            "bytes": 52848
          }
        ],
        "seconds": 31.06,
        "bytes": 186336
      },
      "emergence": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/emergence-00.mp3",
            "seconds": 9.29,
            "bytes": 55728
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/emergence-01.mp3",
            "seconds": 10.9,
            "bytes": 65376
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-escalier/emergence-02.mp3",
            "seconds": 5.04,
            "bytes": 30240
          }
        ],
        "seconds": 25.23,
        "bytes": 151344
      }
    },
    "hy-scene": {
      "accueil": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/accueil-00.mp3",
            "seconds": 11.95,
            "bytes": 71712
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/accueil-01.mp3",
            "seconds": 8.06,
            "bytes": 48384
          }
        ],
        "seconds": 20.01,
        "bytes": 120096
      },
      "induction": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/induction-00.mp3",
            "seconds": 6.74,
            "bytes": 40464
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/induction-01.mp3",
            "seconds": 6.62,
            "bytes": 39744
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/induction-02.mp3",
            "seconds": 7.68,
            "bytes": 46080
          }
        ],
        "seconds": 21.04,
        "bytes": 126288
      },
      "approfondissement": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/approfondissement-00.mp3",
            "seconds": 8.98,
            "bytes": 53856
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/approfondissement-01.mp3",
            "seconds": 7.92,
            "bytes": 47520
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/approfondissement-02.mp3",
            "seconds": 6.82,
            "bytes": 40896
          }
        ],
        "seconds": 23.72,
        "bytes": 142272
      },
      "visualisation": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/visualisation-00.mp3",
            "seconds": 15.19,
            "bytes": 91152
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/visualisation-01.mp3",
            "seconds": 8.64,
            "bytes": 51840
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/visualisation-02.mp3",
            "seconds": 10.01,
            "bytes": 60048
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/visualisation-03.mp3",
            "seconds": 6.82,
            "bytes": 40896
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/visualisation-04.mp3",
            "seconds": 7.85,
            "bytes": 47088
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/visualisation-05.mp3",
            "seconds": 7.92,
            "bytes": 47520
          }
        ],
        "seconds": 56.43,
        "bytes": 338544
      },
      "ancrage": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/ancrage-00.mp3",
            "seconds": 10.9,
            "bytes": 65376
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/ancrage-01.mp3",
            "seconds": 6.07,
            "bytes": 36432
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/ancrage-02.mp3",
            "seconds": 9.91,
            "bytes": 59472
          }
        ],
        "seconds": 26.88,
        "bytes": 161280
      },
      "emergence": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/emergence-00.mp3",
            "seconds": 12.72,
            "bytes": 76320
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-scene/emergence-01.mp3",
            "seconds": 8.95,
            "bytes": 53712
          }
        ],
        "seconds": 21.67,
        "bytes": 130032
      }
    },
    "hy-focus": {
      "accueil": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/accueil-00.mp3",
            "seconds": 8.98,
            "bytes": 53856
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/accueil-01.mp3",
            "seconds": 5.95,
            "bytes": 35712
          }
        ],
        "seconds": 14.93,
        "bytes": 89568
      },
      "induction": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/induction-00.mp3",
            "seconds": 7.54,
            "bytes": 45216
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/induction-01.mp3",
            "seconds": 5.18,
            "bytes": 31104
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/induction-02.mp3",
            "seconds": 7.97,
            "bytes": 47808
          }
        ],
        "seconds": 20.69,
        "bytes": 124128
      },
      "approfondissement": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/approfondissement-00.mp3",
            "seconds": 9.26,
            "bytes": 55584
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/approfondissement-01.mp3",
            "seconds": 8.45,
            "bytes": 50688
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/approfondissement-02.mp3",
            "seconds": 8.95,
            "bytes": 53712
          }
        ],
        "seconds": 26.66,
        "bytes": 159984
      },
      "suggestion": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/suggestion-00.mp3",
            "seconds": 6.58,
            "bytes": 39456
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/suggestion-01.mp3",
            "seconds": 9.48,
            "bytes": 56880
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/suggestion-02.mp3",
            "seconds": 7.63,
            "bytes": 45792
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/suggestion-03.mp3",
            "seconds": 7.7,
            "bytes": 46224
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/suggestion-04.mp3",
            "seconds": 5.14,
            "bytes": 30816
          }
        ],
        "seconds": 36.53,
        "bytes": 219168
      },
      "ancrage": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/ancrage-00.mp3",
            "seconds": 12.12,
            "bytes": 72720
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/ancrage-01.mp3",
            "seconds": 5.47,
            "bytes": 32832
          }
        ],
        "seconds": 17.59,
        "bytes": 105552
      },
      "emergence": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/emergence-00.mp3",
            "seconds": 13.27,
            "bytes": 79632
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-focus/emergence-01.mp3",
            "seconds": 9.53,
            "bytes": 57168
          }
        ],
        "seconds": 22.8,
        "bytes": 136800
      }
    },
    "hy-sommeil": {
      "accueil": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/accueil-00.mp3",
            "seconds": 10.15,
            "bytes": 60912
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/accueil-01.mp3",
            "seconds": 7.49,
            "bytes": 44928
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/accueil-02.mp3",
            "seconds": 4.46,
            "bytes": 26784
          }
        ],
        "seconds": 22.1,
        "bytes": 132624
      },
      "induction": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/induction-00.mp3",
            "seconds": 10.32,
            "bytes": 61920
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/induction-01.mp3",
            "seconds": 5.3,
            "bytes": 31824
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/induction-02.mp3",
            "seconds": 8.11,
            "bytes": 48672
          }
        ],
        "seconds": 23.73,
        "bytes": 142416
      },
      "approfondissement": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/approfondissement-00.mp3",
            "seconds": 10.3,
            "bytes": 61776
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/approfondissement-01.mp3",
            "seconds": 7.08,
            "bytes": 42480
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/approfondissement-02.mp3",
            "seconds": 5.35,
            "bytes": 32112
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/approfondissement-03.mp3",
            "seconds": 8.21,
            "bytes": 49248
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/approfondissement-04.mp3",
            "seconds": 10.37,
            "bytes": 62208
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/approfondissement-05.mp3",
            "seconds": 7.15,
            "bytes": 42912
          }
        ],
        "seconds": 48.46,
        "bytes": 290736
      },
      "visualisation": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/visualisation-00.mp3",
            "seconds": 11.78,
            "bytes": 70704
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/visualisation-01.mp3",
            "seconds": 6.53,
            "bytes": 39168
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/visualisation-02.mp3",
            "seconds": 8.16,
            "bytes": 48960
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/visualisation-03.mp3",
            "seconds": 5.69,
            "bytes": 34128
          }
        ],
        "seconds": 32.16,
        "bytes": 192960
      },
      "suggestion": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/suggestion-00.mp3",
            "seconds": 9.91,
            "bytes": 59472
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/suggestion-01.mp3",
            "seconds": 7.9,
            "bytes": 47376
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/suggestion-02.mp3",
            "seconds": 10.58,
            "bytes": 63504
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/suggestion-03.mp3",
            "seconds": 4.22,
            "bytes": 25344
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/suggestion-04.mp3",
            "seconds": 5.66,
            "bytes": 33984
          }
        ],
        "seconds": 38.27,
        "bytes": 229680
      },
      "silence": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/silence-00.mp3",
            "seconds": 6.91,
            "bytes": 41472
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/silence-01.mp3",
            "seconds": 4.73,
            "bytes": 28368
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-sommeil/silence-02.mp3",
            "seconds": 1.87,
            "bytes": 11232
          }
        ],
        "seconds": 13.51,
        "bytes": 81072
      }
    },
    "hy-futur": {
      "accueil": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/accueil-00.mp3",
            "seconds": 8.76,
            "bytes": 52560
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/accueil-01.mp3",
            "seconds": 6.48,
            "bytes": 38880
          }
        ],
        "seconds": 15.24,
        "bytes": 91440
      },
      "induction": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/induction-00.mp3",
            "seconds": 6.84,
            "bytes": 41040
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/induction-01.mp3",
            "seconds": 7.85,
            "bytes": 47088
          }
        ],
        "seconds": 14.69,
        "bytes": 88128
      },
      "approfondissement": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/approfondissement-00.mp3",
            "seconds": 7.61,
            "bytes": 45648
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/approfondissement-01.mp3",
            "seconds": 6.46,
            "bytes": 38736
          }
        ],
        "seconds": 14.07,
        "bytes": 84384
      },
      "visualisation": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/visualisation-00.mp3",
            "seconds": 9.26,
            "bytes": 55584
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/visualisation-01.mp3",
            "seconds": 11.69,
            "bytes": 70128
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/visualisation-02.mp3",
            "seconds": 9.07,
            "bytes": 54432
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/visualisation-03.mp3",
            "seconds": 7.85,
            "bytes": 47088
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/visualisation-04.mp3",
            "seconds": 9.55,
            "bytes": 57312
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/visualisation-05.mp3",
            "seconds": 13.13,
            "bytes": 78768
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/visualisation-06.mp3",
            "seconds": 6.36,
            "bytes": 38160
          }
        ],
        "seconds": 66.91,
        "bytes": 401472
      },
      "suggestion": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/suggestion-00.mp3",
            "seconds": 12.36,
            "bytes": 74160
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/suggestion-01.mp3",
            "seconds": 8.3,
            "bytes": 49824
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/suggestion-02.mp3",
            "seconds": 5.47,
            "bytes": 32832
          }
        ],
        "seconds": 26.13,
        "bytes": 156816
      },
      "emergence": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/emergence-00.mp3",
            "seconds": 15.6,
            "bytes": 93600
          },
          {
            "src": "./media/hypnosis/voix/denise/hy-futur/emergence-01.mp3",
            "seconds": 7.34,
            "bytes": 44064
          }
        ],
        "seconds": 22.94,
        "bytes": 137664
      }
    }
  },
  "henri": {
    "hy-induction": {
      "accueil": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/accueil-00.mp3",
            "seconds": 9.77,
            "bytes": 58608
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/accueil-01.mp3",
            "seconds": 7.85,
            "bytes": 47088
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/accueil-02.mp3",
            "seconds": 5.54,
            "bytes": 33264
          }
        ],
        "seconds": 23.16,
        "bytes": 138960
      },
      "induction": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/induction-00.mp3",
            "seconds": 9.14,
            "bytes": 54864
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/induction-01.mp3",
            "seconds": 13.58,
            "bytes": 81504
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/induction-02.mp3",
            "seconds": 12.5,
            "bytes": 75024
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/induction-03.mp3",
            "seconds": 8.64,
            "bytes": 51840
          }
        ],
        "seconds": 43.86,
        "bytes": 263232
      },
      "approfondissement": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/approfondissement-00.mp3",
            "seconds": 10.32,
            "bytes": 61920
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/approfondissement-01.mp3",
            "seconds": 9.6,
            "bytes": 57600
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/approfondissement-02.mp3",
            "seconds": 9.12,
            "bytes": 54720
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/approfondissement-03.mp3",
            "seconds": 6.05,
            "bytes": 36288
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/approfondissement-04.mp3",
            "seconds": 7.37,
            "bytes": 44208
          }
        ],
        "seconds": 42.46,
        "bytes": 254736
      },
      "suggestion": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/suggestion-00.mp3",
            "seconds": 10.56,
            "bytes": 63360
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/suggestion-01.mp3",
            "seconds": 7.78,
            "bytes": 46656
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/suggestion-02.mp3",
            "seconds": 6,
            "bytes": 36000
          }
        ],
        "seconds": 24.34,
        "bytes": 146016
      },
      "emergence": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/emergence-00.mp3",
            "seconds": 9.46,
            "bytes": 56736
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/emergence-01.mp3",
            "seconds": 13.8,
            "bytes": 82800
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-induction/emergence-02.mp3",
            "seconds": 6.91,
            "bytes": 41472
          }
        ],
        "seconds": 30.17,
        "bytes": 181008
      }
    },
    "hy-escalier": {
      "accueil": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/accueil-00.mp3",
            "seconds": 10.87,
            "bytes": 65232
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/accueil-01.mp3",
            "seconds": 4.37,
            "bytes": 26208
          }
        ],
        "seconds": 15.24,
        "bytes": 91440
      },
      "induction": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/induction-00.mp3",
            "seconds": 10.06,
            "bytes": 60336
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/induction-01.mp3",
            "seconds": 5.28,
            "bytes": 31680
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/induction-02.mp3",
            "seconds": 7.18,
            "bytes": 43056
          }
        ],
        "seconds": 22.52,
        "bytes": 135072
      },
      "approfondissement": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/approfondissement-00.mp3",
            "seconds": 4.06,
            "bytes": 24336
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/approfondissement-01.mp3",
            "seconds": 5.83,
            "bytes": 34992
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/approfondissement-02.mp3",
            "seconds": 6,
            "bytes": 36000
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/approfondissement-03.mp3",
            "seconds": 7.44,
            "bytes": 44640
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/approfondissement-04.mp3",
            "seconds": 5.78,
            "bytes": 34704
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/approfondissement-05.mp3",
            "seconds": 6.6,
            "bytes": 39600
          }
        ],
        "seconds": 35.71,
        "bytes": 214272
      },
      "ancrage": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/ancrage-00.mp3",
            "seconds": 12.55,
            "bytes": 75312
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/ancrage-01.mp3",
            "seconds": 9.24,
            "bytes": 55440
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/ancrage-02.mp3",
            "seconds": 8.62,
            "bytes": 51696
          }
        ],
        "seconds": 30.41,
        "bytes": 182448
      },
      "emergence": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/emergence-00.mp3",
            "seconds": 9.22,
            "bytes": 55296
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/emergence-01.mp3",
            "seconds": 10.32,
            "bytes": 61920
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-escalier/emergence-02.mp3",
            "seconds": 4.8,
            "bytes": 28800
          }
        ],
        "seconds": 24.34,
        "bytes": 146016
      }
    },
    "hy-scene": {
      "accueil": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/accueil-00.mp3",
            "seconds": 11.64,
            "bytes": 69840
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/accueil-01.mp3",
            "seconds": 7.7,
            "bytes": 46224
          }
        ],
        "seconds": 19.34,
        "bytes": 116064
      },
      "induction": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/induction-00.mp3",
            "seconds": 6.55,
            "bytes": 39312
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/induction-01.mp3",
            "seconds": 6.58,
            "bytes": 39456
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/induction-02.mp3",
            "seconds": 7.2,
            "bytes": 43200
          }
        ],
        "seconds": 20.33,
        "bytes": 121968
      },
      "approfondissement": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/approfondissement-00.mp3",
            "seconds": 8.81,
            "bytes": 52848
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/approfondissement-01.mp3",
            "seconds": 7.58,
            "bytes": 45504
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/approfondissement-02.mp3",
            "seconds": 6.62,
            "bytes": 39744
          }
        ],
        "seconds": 23.01,
        "bytes": 138096
      },
      "visualisation": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/visualisation-00.mp3",
            "seconds": 15.46,
            "bytes": 92736
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/visualisation-01.mp3",
            "seconds": 8.3,
            "bytes": 49824
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/visualisation-02.mp3",
            "seconds": 9.48,
            "bytes": 56880
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/visualisation-03.mp3",
            "seconds": 6.82,
            "bytes": 40896
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/visualisation-04.mp3",
            "seconds": 7.7,
            "bytes": 46224
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/visualisation-05.mp3",
            "seconds": 7.9,
            "bytes": 47376
          }
        ],
        "seconds": 55.66,
        "bytes": 333936
      },
      "ancrage": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/ancrage-00.mp3",
            "seconds": 10.87,
            "bytes": 65232
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/ancrage-01.mp3",
            "seconds": 5.71,
            "bytes": 34272
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/ancrage-02.mp3",
            "seconds": 9.36,
            "bytes": 56160
          }
        ],
        "seconds": 25.94,
        "bytes": 155664
      },
      "emergence": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/emergence-00.mp3",
            "seconds": 12.05,
            "bytes": 72288
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-scene/emergence-01.mp3",
            "seconds": 8.59,
            "bytes": 51552
          }
        ],
        "seconds": 20.64,
        "bytes": 123840
      }
    },
    "hy-focus": {
      "accueil": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/accueil-00.mp3",
            "seconds": 8.45,
            "bytes": 50688
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/accueil-01.mp3",
            "seconds": 5.9,
            "bytes": 35424
          }
        ],
        "seconds": 14.35,
        "bytes": 86112
      },
      "induction": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/induction-00.mp3",
            "seconds": 7.15,
            "bytes": 42912
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/induction-01.mp3",
            "seconds": 5.04,
            "bytes": 30240
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/induction-02.mp3",
            "seconds": 8.09,
            "bytes": 48528
          }
        ],
        "seconds": 20.28,
        "bytes": 121680
      },
      "approfondissement": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/approfondissement-00.mp3",
            "seconds": 9.05,
            "bytes": 54288
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/approfondissement-01.mp3",
            "seconds": 8.21,
            "bytes": 49248
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/approfondissement-02.mp3",
            "seconds": 8.76,
            "bytes": 52560
          }
        ],
        "seconds": 26.02,
        "bytes": 156096
      },
      "suggestion": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/suggestion-00.mp3",
            "seconds": 6.48,
            "bytes": 38880
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/suggestion-01.mp3",
            "seconds": 8.98,
            "bytes": 53856
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/suggestion-02.mp3",
            "seconds": 7.39,
            "bytes": 44352
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/suggestion-03.mp3",
            "seconds": 7.2,
            "bytes": 43200
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/suggestion-04.mp3",
            "seconds": 4.87,
            "bytes": 29232
          }
        ],
        "seconds": 34.92,
        "bytes": 209520
      },
      "ancrage": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/ancrage-00.mp3",
            "seconds": 12.02,
            "bytes": 72144
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/ancrage-01.mp3",
            "seconds": 5.5,
            "bytes": 32976
          }
        ],
        "seconds": 17.52,
        "bytes": 105120
      },
      "emergence": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/emergence-00.mp3",
            "seconds": 12.22,
            "bytes": 73296
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-focus/emergence-01.mp3",
            "seconds": 9.36,
            "bytes": 56160
          }
        ],
        "seconds": 21.58,
        "bytes": 129456
      }
    },
    "hy-sommeil": {
      "accueil": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/accueil-00.mp3",
            "seconds": 9.89,
            "bytes": 59328
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/accueil-01.mp3",
            "seconds": 7.34,
            "bytes": 44064
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/accueil-02.mp3",
            "seconds": 4.32,
            "bytes": 25920
          }
        ],
        "seconds": 21.55,
        "bytes": 129312
      },
      "induction": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/induction-00.mp3",
            "seconds": 10.32,
            "bytes": 61920
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/induction-01.mp3",
            "seconds": 5.28,
            "bytes": 31680
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/induction-02.mp3",
            "seconds": 8.11,
            "bytes": 48672
          }
        ],
        "seconds": 23.71,
        "bytes": 142272
      },
      "approfondissement": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/approfondissement-00.mp3",
            "seconds": 9.89,
            "bytes": 59328
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/approfondissement-01.mp3",
            "seconds": 7.25,
            "bytes": 43488
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/approfondissement-02.mp3",
            "seconds": 5.26,
            "bytes": 31536
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/approfondissement-03.mp3",
            "seconds": 8.11,
            "bytes": 48672
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/approfondissement-04.mp3",
            "seconds": 10.06,
            "bytes": 60336
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/approfondissement-05.mp3",
            "seconds": 7.34,
            "bytes": 44064
          }
        ],
        "seconds": 47.91,
        "bytes": 287424
      },
      "visualisation": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/visualisation-00.mp3",
            "seconds": 11.47,
            "bytes": 68832
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/visualisation-01.mp3",
            "seconds": 6.5,
            "bytes": 39024
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/visualisation-02.mp3",
            "seconds": 8.16,
            "bytes": 48960
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/visualisation-03.mp3",
            "seconds": 5.45,
            "bytes": 32688
          }
        ],
        "seconds": 31.58,
        "bytes": 189504
      },
      "suggestion": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/suggestion-00.mp3",
            "seconds": 9.72,
            "bytes": 58320
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/suggestion-01.mp3",
            "seconds": 7.68,
            "bytes": 46080
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/suggestion-02.mp3",
            "seconds": 10.7,
            "bytes": 64224
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/suggestion-03.mp3",
            "seconds": 4.34,
            "bytes": 26064
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/suggestion-04.mp3",
            "seconds": 5.5,
            "bytes": 32976
          }
        ],
        "seconds": 37.94,
        "bytes": 227664
      },
      "silence": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/silence-00.mp3",
            "seconds": 6.96,
            "bytes": 41760
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/silence-01.mp3",
            "seconds": 4.61,
            "bytes": 27648
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-sommeil/silence-02.mp3",
            "seconds": 1.87,
            "bytes": 11232
          }
        ],
        "seconds": 13.44,
        "bytes": 80640
      }
    },
    "hy-futur": {
      "accueil": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/accueil-00.mp3",
            "seconds": 8.86,
            "bytes": 53136
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/accueil-01.mp3",
            "seconds": 6.46,
            "bytes": 38736
          }
        ],
        "seconds": 15.32,
        "bytes": 91872
      },
      "induction": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/induction-00.mp3",
            "seconds": 6.82,
            "bytes": 40896
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/induction-01.mp3",
            "seconds": 7.37,
            "bytes": 44208
          }
        ],
        "seconds": 14.19,
        "bytes": 85104
      },
      "approfondissement": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/approfondissement-00.mp3",
            "seconds": 7.66,
            "bytes": 45936
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/approfondissement-01.mp3",
            "seconds": 6.26,
            "bytes": 37584
          }
        ],
        "seconds": 13.92,
        "bytes": 83520
      },
      "visualisation": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/visualisation-00.mp3",
            "seconds": 9.22,
            "bytes": 55296
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/visualisation-01.mp3",
            "seconds": 11.3,
            "bytes": 67824
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/visualisation-02.mp3",
            "seconds": 8.98,
            "bytes": 53856
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/visualisation-03.mp3",
            "seconds": 7.58,
            "bytes": 45504
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/visualisation-04.mp3",
            "seconds": 9.29,
            "bytes": 55728
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/visualisation-05.mp3",
            "seconds": 12.14,
            "bytes": 72864
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/visualisation-06.mp3",
            "seconds": 6.31,
            "bytes": 37872
          }
        ],
        "seconds": 64.82,
        "bytes": 388944
      },
      "suggestion": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/suggestion-00.mp3",
            "seconds": 11.66,
            "bytes": 69984
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/suggestion-01.mp3",
            "seconds": 7.85,
            "bytes": 47088
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/suggestion-02.mp3",
            "seconds": 5.28,
            "bytes": 31680
          }
        ],
        "seconds": 24.79,
        "bytes": 148752
      },
      "emergence": {
        "lines": [
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/emergence-00.mp3",
            "seconds": 14.9,
            "bytes": 89424
          },
          {
            "src": "./media/hypnosis/voix/henri/hy-futur/emergence-01.mp3",
            "seconds": 7.15,
            "bytes": 42912
          }
        ],
        "seconds": 22.05,
        "bytes": 132336
      }
    }
  }
}
