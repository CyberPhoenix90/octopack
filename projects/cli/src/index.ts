#!/usr/bin/env node

import { findConfiguration } from '../../libraries/config_resolver';
import { localDiskFileSystem } from '../../libraries/file_system';

findConfiguration(process.cwd(), localDiskFileSystem);
