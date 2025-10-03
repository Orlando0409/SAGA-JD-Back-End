import { AppDataSource } from '../data-source';

async function checkSchemaSync() {
    try {
        console.log('🔍 Checking schema synchronization...');
        
        // Inicializar conexión
        await AppDataSource.initialize();
        
        // Generar el schema que TypeORM espera basado en las entidades
        const sqlInMemory = await AppDataSource.driver.createSchemaBuilder().log();
        
        if (sqlInMemory.upQueries && sqlInMemory.upQueries.length > 0) {
            console.log('❌ SCHEMA OUT OF SYNC');
            console.log('📋 Changes needed to synchronize:');
            console.log('═══════════════════════════════════');
            
            sqlInMemory.upQueries.forEach((query, index) => {
                console.log(`${index + 1}. ${query.query}`);
                if (query.parameters && query.parameters.length > 0) {
                    console.log(`   Parameters: ${JSON.stringify(query.parameters)}`);
                }
            });
            
            console.log('═══════════════════════════════════');
            console.log('💡 To fix: Generate a migration with these changes');
            console.log('   Run: npm run mig:gen');
        } else {
            console.log('✅ SCHEMA IS SYNCHRONIZED');
            console.log('🎉 Your entities match the database schema perfectly!');
        }
        
    } catch (error) {
        console.error('❌ Error checking schema sync:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

checkSchemaSync();