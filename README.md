# Yeoman generator runner


# Usage
```yaml
- uses: skafld/yeoman-generator-runner
  with:
    #
    # Yeoman generator.
    generator:: ''
    #
    # Node package containing the yeoman generator
    package: ''
    #
    # Contains files or directories to ignore
    untracked-files: '[]'
    #
    # Do not automatically install dependencies
    skip-install: 'true'
    #
    # Contains files or directories to ignore
    untracked-files: '[]'
    #
    # Yeoman generator answers
    answers: '{}'
    #
    # Yeoman generator options
    options: '{}'
    #
    # Yeoman working directory
    options: '.'
    #
    # Git config
    git-config: |
        {
            "user.name": "github-actions",
            "user.email": "github-actions@github.com"
        }
    #
    # Github token
    github-token: ''
```

Run from private repo
```yaml
    -
      name: Checkout Runner
      uses: actions/checkout@v2
      with:
        repository: skafld/yeoman-generator-runner
        path: ./.temp/yeoman-generator-runner
        token: ${{ secrets.CI_PAT }}
        clean: true
        ref: main
    -
      name: Checkout Generator
      uses: actions/checkout@v2
      with:
        repository: skafld/generator-skafld
        path: ./.temp/generator-skafld
        token: ${{ secrets.CI_PAT }}
        clean: true
        ref: main
    -
      id: config
      name: Read Answers
      run: |
        echo "::set-output name=answers::$(jq '."generator-skafld"' .yo-rc.json --compact-output  --raw-output)"
    -
      name: Run Generator
      uses: ./.temp/yeoman-generator-runner
      with:
        generator: skafld:java
        github-token: '${{ secrets.CI_PAT }}'
        package: ./.temp/generator-skafld
        answers: '${{ steps.config.outputs.answers }}'
        git-remote-origin-url: https://x-access-token:${{ secrets.CI_PAT }}@github.com/${{ github.repository }}
        untracked-files: |
          [
            "src/*"
          ]
```