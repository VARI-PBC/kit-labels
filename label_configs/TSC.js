module.exports = [
  {
    'kitTypes': ['TSC* Kit'],
    'labels': [
      {
        'description': 'kit label',
        'templateFile': 'Kit ID Label.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btID',
        'value': '%kitLabel%'
      }
    ]
  },
  {
    'kitTypes': ['TSC NHD Blood Kit'],
    'componentTypes': ['TSC-EDTA 6ml Tube'],
    'labels': [
      {
        'description': 'EDTA tube',
        'templateFile': 'TSC Blood Tubes.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btDescriptor',
        'value': 'Peripheral Blood only'
      }
    ]
  },
  {
    'kitTypes': ['TSC NHD Blood Kit'],
    'labels': [
      {
        'description': 'media expiration',
        'templateFile': 'Media Expiration.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btMedia1',
        'value': 'EDTA Tubes'
      },
      {
        'name': 'btExpDate1',
        'value': (kitFields, components) => components['TSC-EDTA 6ml Tube'].expiration.substr(0, 7)
      }
    ]
  },
  {
    'kitTypes': ['TSC RDCRN Blood Kit'],
    'componentTypes': ['TSC-EDTA 6ml Tube'],
    'labels': [
      {
        'description': 'EDTA tube',
        'templateFile': 'TSC Blood Tubes.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btDescriptor',
        'value': 'Peripheral Blood only'
      }
    ]
  },
  {
    'kitTypes': ['TSC RDCRN Blood Kit'],
    'labels': [
      {
        'description': 'media expiration',
        'templateFile': 'Media Expiration.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btMedia1',
        'value': 'PAXgene RNA Tubes'
      },
      {
        'name': 'btExpDate1',
        'value': (kitFields, components) => components['TSC-PAXgene RNA Tube'].expiration.substr(0, 7)
      }
    ]
  },
  {
    'kitTypes': ['TSC PReVENT Blood Kit'],
    'componentTypes': ['TSC-EDTA 6ml Tube'],
    'labels': [
      {
        'description': 'EDTA tube',
        'templateFile': 'TSC Blood Tubes.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btDescriptor',
        'value': 'Peripheral Blood only'
      }
    ]
  },
  {
    'kitTypes': ['TSC PReVENT Blood Kit'],
    'componentTypes': ['TSC-PAXgene RNA Tube'],
    'labels': [
      {
        'description': 'PAXgene RNA tube',
        'templateFile': 'TSC Blood Tubes.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btDescriptor',
        'value': 'Peripheral Blood only'
      }
    ]
  },
  {
    'kitTypes': ['TSC PReVENT Blood Kit'],
    'labels': [
      {
        'description': 'media expiration',
        'templateFile': 'Media Expiration.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btMedia1',
        'value': 'EDTA Tubes'
      },
      {
        'name': 'btExpDate2',
        'value': (kitFields, components) => components['TSC-EDTA 6ml Tube'].expiration.substr(0, 7)
      },
      {
        'name': 'btMedia2',
        'value': 'PAXgene RNA Tubes'
      },
      {
        'name': 'btExpDate2',
        'value': (kitFields, components) => components['TSC-PAXgene RNA Tube'].expiration.substr(0, 7)
      }
    ]
  },
  {
    'kitTypes': ['TSC NHD Buccal Kit'],
    'labels': [
      {
        'description': 'buccal',
        'templateFile': 'TSC Buccal.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btID',
        'value': '%kitLabel%'
      }
    ]
  },
  {
    'kitTypes': ['TSC NHD Tissue Kit'],
    'componentTypes': ['TSC-CryoELITE Vial', 'TSC-Formalin Cups'],
    'labels': [
      {
        'description': 'CryoELITE',
        'templateFile': 'Cryovial.btw',
        'printer': 'BW2BW10'
      },
      {
        'description': 'paperwork',
        'templateFile': 'Paperwork.btw',
        'printer': 'BW2BW10'
      }
    ],
    'labelVariables': [
      {
        'name': 'btID',
        'value': '%kitLabel%-%sequence%',
        'sequenceSpec': '1-4'
      },
      {
        'name': 'btDescriptor',
        'value': 'Tissue'
      }
    ]
  }
]
