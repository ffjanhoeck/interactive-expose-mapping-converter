const fieldNameToCategoryMapping = require('./FieldNameToCategoryMapping');

class Converter {
    convertField(field) {
        if (!field.metadata) {
            field.metadata = {};
        }

        let convertedField = {};
        if (field.fieldName && fieldNameToCategoryMapping.hasOwnProperty(field.fieldName)) {
            const categoryName = fieldNameToCategoryMapping[field.fieldName];
            const {indexes, tag, search, ...others} = field.metadata;

            convertedField = {
                type: 'MULTIMEDIA',
                categoryName: categoryName,
                availableAtStage: field.availableAtStage,
                metadata: {
                    ...others,
                    availableRange: {
                        from: Math.min(...(indexes || [0])),
                        to: Math.max(...(indexes || [0]))
                    },
                    tag: tag || field.fieldEName
                }
            };

            if (!field.metadata.indexes) {
                delete convertedField.metadata.availableRange;
            }

            if (typeof search === 'object') {
                const searchTerm = search.value;
                if (searchTerm === 'cadastralMap') {
                    convertedField.categoryName = 'cadastral_map';
                    delete convertedField.metadata.tag;
                } else if (searchTerm === 'standardLandValue') {
                    convertedField.categoryName = 'standard_land_value';
                    delete convertedField.metadata.tag;
                }
            }
        } else {
            convertedField = field;

            if (field.categoryName) {
                convertedField.type = 'MULTIMEDIA'
            } else {
                convertedField.type = 'ENTITY_FIELD'
            }
        }
        return convertedField;
    }

    convertMapping(mapping) {
        const mappingCopy = Object.assign({}, mapping);
        mappingCopy.additionalData = mapping.additionalData.map(additionalData => this.convertField(additionalData));
        mappingCopy.sections.forEach(section => {
            section.articles.forEach(article => {
                article.fields = article.fields.map(field => this.convertField(field));
            });
        });
        return mappingCopy;
    }
}

module.exports = new Converter();
