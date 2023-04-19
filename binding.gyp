{
  "targets": [
    {
      "target_name": "pact",
      "sources": [
        "native/addon.cc",
        "native/ffi.cc",
        "native/consumer.cc",
        "native/provider.cc",
        "native/plugin.cc"
      ],
      "include_dirs": [
        "<!(node -p \"require('node-addon-api').include_dir\")",
        "<(module_root_dir)/native",
        "<(module_root_dir)/ffi",
      ],
      "conditions": [
        [
          "OS=='win'",
          {
            "libraries": [
              "<(module_root_dir)/ffi/pact_ffi.dll.lib"
            ],
            "defines": [
              "_HAS_EXCEPTIONS=1"
            ],
            "msvs_settings": {
              "VCCLCompilerTool": {
                "ExceptionHandling": 1
              }
            },
            "copies":[{
                "files": [ "<(module_root_dir)/ffi/pact_ffi.dll"],
                "destination": "<(module_path)"
                }],
          }
        ],
        [
          "OS==\"mac\" and target_arch ==\"x64\"",
          {
            "xcode_settings": {
              "GCC_SYMBOLS_PRIVATE_EXTERN": "YES",
              "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
              "GCC_TREAT_WARNINGS_AS_ERRORS": "YES",
              "CLANG_CXX_LIBRARY": "libc++",
              "MACOSX_DEPLOYMENT_TARGET": "10.7"
            },
            "link_settings": {
              "libraries": [
                "-lpact_ffi",
                "-L<(module_root_dir)/ffi",
                "-Wl,-rpath,@loader_path"
              ]
            },
            "copies":[{
                "files": [ "<(module_root_dir)/ffi/libpact_ffi.dylib"],
                "destination": "<(module_path)"
                }],
          }
        ],
        [
          "OS==\"mac\" and target_arch ==\"arm64\"",
          {
            "xcode_settings": {
              "GCC_SYMBOLS_PRIVATE_EXTERN": "YES",
              "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
              "GCC_TREAT_WARNINGS_AS_ERRORS": "YES",
              "CLANG_CXX_LIBRARY": "libc++",
              "MACOSX_DEPLOYMENT_TARGET": "10.7"
            },
            "link_settings": {
              "libraries": [
                "-lpact_ffi",
                "-L<(module_root_dir)/ffi",
                "-Wl,-rpath,@loader_path"
              ]
            },
            "copies":[{
                "files": [ "<(module_root_dir)/ffi/libpact_ffi.dylib"],
                "destination": "<(module_path)"
                }],
          }
        ],
        [
          "OS==\"linux\" and target_arch ==\"x64\"",
          {
            "link_settings": {
              "libraries": [
                "-lpact_ffi",
                "-L<(module_root_dir)/ffi",
                "-Wl,-rpath,'$$ORIGIN'"
              ]
            },
            "copies":[{
                "files": [ "<(module_root_dir)/ffi/libpact_ffi.so"],
                "destination": "<(module_path)"
                }],
          }
        ],
        [
          "OS==\"linux\" and target_arch ==\"arm64\"",
          {
            "link_settings": {
              "libraries": [
                "-lpact_ffi",
                "-L<(module_root_dir)/ffi",
                "-Wl,-rpath,'$$ORIGIN'"
              ]
            },
            "copies":[{
                "files": [ "<(module_root_dir)/ffi/libpact_ffi.so"],
                "destination": "<(module_path)"
                }],
          }
        ]
      ],
      "library_dirs": [
        "<(module_root_dir)/native"
      ],
      "cflags_cc!": [
        "-fno-exceptions",
      ],
      "cflags_cc": [ "-Werror" ],
      "defines": [
        "NAPI_CPP_EXCEPTIONS"
      ]
    },
    # Need to set the library install name to enable the rpath settings to work on OSX
    {
      "target_name": "set_osx_install_name",
      "dependencies": ["pact"],
      "type": "none",
      "target_conditions":[
        [
          "OS==\"mac\"",
          {
            "actions": [
              {
                "action_name": "modify install_name on osx",
                "inputs": ["<(module_root_dir)/build/Release/pact.node"],
                "outputs": ["<(module_root_dir)/build/Release/pact.node"],
                'action': ['install_name_tool', '-change', 'libpact_ffi.dylib', '@rpath/libpact_ffi.dylib', '<(module_path)/pact.node'],
              }
            ]
          }
        ]
      ]
    },
    # Uses node-pre-gyp to pre-create binaries, and utilise them for consumers 
    # from published releases
    {
      "target_name": "action_after_build",
      "type": "none",
      "dependencies": [ "<(module_name)" ],
      "copies": [
        {
          "files": [ "<(PRODUCT_DIR)/<(module_name).node" ],
          "destination": "<(module_path)"
        },
        {
          "files": [ "<(module_root_dir)/standalone" ],
          "destination": "<(module_path)"
        }
      ]
    }
  ]
}
