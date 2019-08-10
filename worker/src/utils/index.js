export function safeUpsert (
	collection,
	filter,
	update
) {
	return collection.updateOne(filter, update, { upsert: true })
		.catch((_) =>
			collection.updateOne(filter, update)
		)
}
