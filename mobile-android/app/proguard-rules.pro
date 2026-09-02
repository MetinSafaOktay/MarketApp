# kotlinx.serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class **$$serializer { *; }
-keepclasseswithmembers class com.erenlermarket.app.data.remote.dto.** {
    *** Companion;
}
-keep,includedescriptorclasses class com.erenlermarket.app.data.remote.dto.**$$serializer { *; }
