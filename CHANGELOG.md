# Changelog
All notable changes to this project will be documented in this file.

The format is (loosely) based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.3](https://github.com/doesdev/pg-ears/compare/1.2.2...1.2.3)
#### 2020-01-18
- Add recommendation to use `pg-listen`
- Call UNLISTEN before LISTEN
  - though this may have no effect
  - UNLISTEN only cancels listeners for session
  - this will really only be called in a new session
- Be more careful about killing clients (prevent noise)
- Set application_name to 'pg-ears' if not set
- Fix some standard style warnings

## [1.2.2](https://github.com/doesdev/pg-ears/compare/1.2.1...1.2.2)
#### 2020-01-18
- Update `pg` to 7.17.1

## [1.2.1](https://github.com/doesdev/pg-ears/compare/1.2.0...1.2.1)
#### 2019-07-31
- Update `pg` to 7.12.0
- Switch from ava to mvt for tests

## [1.2.0](https://github.com/doesdev/pg-ears/compare/1.1.1...1.2.0)
#### 2018-11-23
- Fix [#4](https://github.com/doesdev/pg-ears/issues/4), error thrown on disconnect
- Code style updates
- Update `pg` to 7.6.1

## [1.1.1](https://github.com/doesdev/pg-ears/compare/1.1.0...1.1.1)
#### 2018-10-09
- Meaningless update :/

## [1.1.0](https://github.com/doesdev/pg-ears/compare/v1.0.0...1.1.0)
#### 2018-06-28
- Update `pg` to 7.4.3
- Update `ava` to 0.25.0

## [1.0.0](https://github.com/doesdev/pg-ears/releases/tag/v1.0.0)
#### 2017-08-11
- Initial release
