#!/bin/bash

cd "$1"

SED_OPTION="-r"
if [ "$(uname)" == "Darwin" ]; then
    SED_OPTION="-E"
fi

referenceFile=$(mktemp -t office365_mail_notifier.dtd)
grep -Eo "ENTITY [a-zA-Z\.]+ " en-US/office365_mail_notifier.dtd | sed $SED_OPTION "s/(ENTITY| )//g" > "$referenceFile"

ls -1 */office365_mail_notifier.dtd | while read file ; do
    tmpFile=$(mktemp -t office365_mail_notifier.dtd)
    grep -Eo "ENTITY [a-zA-Z\.]+ " "$file" | sed $SED_OPTION "s/(ENTITY| )//g" > "$tmpFile"
    echo "**** $file ****"
    diff "$referenceFile" "$tmpFile"
    rm "$tmpFile"
done

rm "$referenceFile"

echo " === "

referenceFile=$(mktemp -t office365_mail_notifier.dtd)
grep -Eo "^[a-zA-Z\.]+=" en-US/office365_mail_notifier.properties > "$referenceFile"

ls -1 */office365_mail_notifier.properties | while read file ; do 
    tmpFile=$(mktemp -t office365_mail_notifier.properties)
    grep -Eo "^[a-zA-Z\.]+=" "$file" > "$tmpFile"
    echo "**** $file ****"
    diff "$referenceFile" "$tmpFile"
    rm "$tmpFile"
done

rm "$referenceFile"

