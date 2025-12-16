const fs = require('fs').promises;
const path = require('path');
const LoggerUtil = require('./LoggerUtil');
const System = require('../model/System');

class PluginHelper {
    #logger = new LoggerUtil('PluginHelper');

    /**
     * Get plugin paths from database config
     */
    async getPluginPaths() {
        try {
            // Get all plugin paths from system config
            const configs = await System.getBy({
                category: 'MONITORING',
                sub_category: 'PLUGIN_PATHS'
            });

            return configs.map(c => c.value);
        } catch (err) {
            this.#logger.error('getPluginPaths', err);
            // Return default paths on error
            return null
        }
    }

    /**
     * Check if directory exists
     */
    async directoryExists(dirPath) {
        try {
            const stats = await fs.stat(dirPath);
            return stats.isDirectory();
        } catch (err) {
            return false;
        }
    }

    /**
     * Read plugin.json metadata
     */
    async readPluginMetadata(pluginDir) {
        try {
            const pluginJsonPath = path.join(pluginDir, 'plugin.json');
            const data = await fs.readFile(pluginJsonPath, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            return null;
        }
    }

    /**
     * Scan a directory for plugins
     */
    async scanPluginDirectory(dirPath) {
        const plugins = [];

        try {
            const exists = await this.directoryExists(dirPath);
            if (!exists) {
                this.#logger.info(`Plugin directory does not exist: ${dirPath}`);
                return plugins;
            }

            const entries = await fs.readdir(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const pluginPath = path.join(dirPath, entry.name);
                    const metadata = await this.readPluginMetadata(pluginPath);

                    if (metadata) {
                        plugins.push({
                            id: metadata.id || entry.name,
                            name: metadata.name || entry.name,
                            version: metadata.info?.version || metadata.version || 'unknown',
                            type: metadata.type || 'panel',
                            author: metadata.info?.author?.name || metadata.author || 'unknown',
                            description: metadata.info?.description || metadata.description || '',
                            path: pluginPath
                        });
                    } else {
                        // Plugin without metadata file
                        plugins.push({
                            id: entry.name,
                            name: entry.name,
                            version: 'unknown',
                            type: 'unknown',
                            author: 'unknown',
                            description: 'No plugin.json found',
                            path: pluginPath
                        });
                    }
                }
            }
        } catch (err) {
            this.#logger.error(`scanPluginDirectory - ${dirPath}`, err);
        }

        return plugins;
    }

    /**
     * Get all installed plugins from all configured paths
     */
    async getAllPlugins() {
        try {
            const pluginPaths = await this.getPluginPaths();
            const allPlugins = [];

            for (const pluginPath of pluginPaths) {
                const plugins = await this.scanPluginDirectory(pluginPath);
                
                plugins.forEach(plugin => {
                    plugin.source = pluginPath;
                });

                allPlugins.push(...plugins);
            }

            return allPlugins;
        } catch (err) {
            this.#logger.error('getAllPlugins', err);
            return [];
        }
    }

    /**
     * Get plugin summary by type
     */
    async getPluginSummary() {
        try {
            const plugins = await this.getAllPlugins();

            const summary = {
                total: plugins.length,
                byType: {},
                bySource: {}
            };

            plugins.forEach(plugin => {
                // Count by type
                summary.byType[plugin.type] = (summary.byType[plugin.type] || 0) + 1;
                
                // Count by source
                summary.bySource[plugin.source] = (summary.bySource[plugin.source] || 0) + 1;
            });

            return summary;
        } catch (err) {
            this.#logger.error('getPluginSummary', err);
            return {
                total: 0,
                byType: {},
                bySource: {}
            };
        }
    }
}

module.exports = new PluginHelper();